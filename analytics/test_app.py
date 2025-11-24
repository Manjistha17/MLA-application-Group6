import pytest
import json
from unittest.mock import MagicMock, patch
from app import app, get_user_weight, db

# -------------------- MOCK COLLECTIONS --------------------
db.users = MagicMock()
db.exercises = MagicMock()
db.activity_mets_new = MagicMock()

# -------------------- FLASK CLIENT --------------------
@pytest.fixture
def client():
    app.testing = True
    return app.test_client()


# -------------------- TEST get_user_weight --------------------
def test_get_user_weight_found():
    db.users.find_one.return_value = {"weight": 75}
    result = get_user_weight("john")
    assert result == 75

def test_get_user_weight_default():
    db.users.find_one.return_value = None
    result = get_user_weight("missing_user")
    assert result == 66


# -------------------- TEST GET / --------------------
def test_index_route(client):
    fake_docs = [{"exerciseType": "Run", "duration": 30}]
    mock_cursor = MagicMock()
    mock_cursor.__iter__.return_value = fake_docs
    db.exercises.find.return_value = mock_cursor

    response = client.get("/")
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data[0]["exerciseType"] == "Run"


# -------------------- TEST GET /stats --------------------
def test_stats_route(client):
    output = [{"username": "alice", "exercises": [{"exerciseType": "Run", "totalDuration": 120}]}]
    db.exercises.aggregate.return_value = output

    response = client.get("/stats")
    assert response.status_code == 200
    assert response.json["stats"] == output


# -------------------- TEST GET /stats/<username> --------------------
def test_user_stats_route(client):
    output = [{"username": "testuser", "exercises": [{"exerciseType": "Swim", "totalDuration": 50}]}]
    db.exercises.aggregate.return_value = output

    response = client.get("/stats/testuser")
    assert response.status_code == 200
    assert response.json["stats"] == output


# -------------------- TEST GET /stats/weekly/ --------------------
def test_weekly_stats_valid(client):
    fake_output = [{"exerciseType": "Run", "totalDuration": 90}]
    db.exercises.aggregate.return_value = fake_output

    response = client.get("/stats/weekly/?user=alice&start=2024-01-01&end=2024-01-07")
    assert response.status_code == 200
    assert response.json["stats"] == fake_output

def test_weekly_stats_invalid_date(client):
    response = client.get("/stats/weekly/?user=alice&start=BAD&end=DATE")
    assert response.status_code == 400
    assert "error" in response.json


# -------------------- TEST GET /stats/daily/ --------------------
def test_daily_stats(client):
    db.users.find_one.return_value = {"weight": 70}
    db.activity_mets_new.find.return_value = [
        {"activity": "Run", "sub_activity_options": [{"name": "Jogging", "met": 6.5}]}
    ]
    fake_output = [{"exerciseType": "Run", "subActivity": "Jogging", "totalDuration": 30, "totalCalories": 220, "count": 1}]
    db.exercises.aggregate.return_value = fake_output

    response = client.get("/stats/daily/?user=alice")
    assert response.status_code == 200
    assert response.json["stats"][0]["exerciseType"] == "Run"
