import unittest
from app import app
from unittest.mock import patch

class TestStatsAPI(unittest.TestCase):

    @patch("app.db")
    def test_stats_existing_user(self, mock_db):
        mock_db.exercises.aggregate.return_value = [
            {
                "exerciseType": "Running",
                "totalDuration": 71
            },
            {
                "exerciseType": "Yoga",
                "totalDuration": 30
            }
        ]

        tester = app.test_client()
        response = tester.get("/stats/manji")

        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(len(data["stats"]), 2)
        self.assertEqual(data["stats"][0]["exerciseType"], "Running")
