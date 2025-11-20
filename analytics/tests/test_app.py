import unittest
from analytics.app import app
import json

class AnalyticsTestCase(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    def tearDown(self):
        pass  # Add cleanup code if needed

    def test_home(self):
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
        # Optionally check response data structure
        data = json.loads(response.data)
        self.assertIsInstance(data, list)

    def test_stats(self):
        response = self.client.get('/stats')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('stats', data)
        self.assertIsInstance(data['stats'], list)

    def test_post_example(self):
        # Example: test a POST endpoint (replace '/add_exercise' and payload as needed)
        payload = {
            'username': 'testuser',
            'exerciseType': 'Running',
            'description': 'Morning run',
            'duration': 30,
            'date': '2025-11-12T07:00:00Z'
        }
        response = self.client.post(
            '/add_exercise',  # Change to your actual POST endpoint
            data=json.dumps(payload),
            content_type='application/json'
        )
        # Adjust expected status code and response as needed
        self.assertIn(response.status_code, (200, 201, 400))
        # Optionally check response data
        # data = response.get_json()
        # self.assertIn('message', data)

if __name__ == '__main__':
    unittest.main()
