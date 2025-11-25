import unittest
from app import app
from unittest.mock import patch

class TestStatsAPI(unittest.TestCase):

    @patch("app.db")
    def test_stats_new_user(self, mock_db):

        mock_db.exercises.aggregate.return_value = []

        tester = app.test_client()
        response = tester.get("/stats/madhu")

        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data["stats"], [])
