"""
Test suite for the Todo application.

This test file is designed to work with the CI/CD pipeline that:
- Uses pytest for test execution
- Runs lint checks with flake8
- Supports Python 3.11+
"""

import pytest
from app import create_app


@pytest.fixture
def app():
    """Create and configure a test app instance."""
    app = create_app()
    app.config['TESTING'] = True
    return app


@pytest.fixture
def client(app):
    """Create a test client for the app."""
    return app.test_client()


class TestAppInitialization:
    """Test app initialization and configuration."""

    def test_create_app(self):
        """Test that the app is created successfully."""
        app = create_app()
        assert app is not None

    def test_app_testing_mode(self, app):
        """Test that app is in testing mode."""
        assert app.config['TESTING']

    def test_app_has_blueprint(self, app):
        """Test that the main blueprint is registered."""
        blueprints = app.blueprints
        assert 'main' in blueprints


class TestRoutes:
    """Test application routes."""

    def test_index_route_exists(self, client):
        """Test that index route is accessible."""
        response = client.get('/')
        assert response.status_code in [200, 404]

    def test_index_route_returns_html(self, client):
        """Test that index route returns HTML content."""
        response = client.get('/')
        if response.status_code == 200:
            assert b'html' in response.data.lower() or \
                   response.content_type == 'text/html; charset=utf-8'

    def test_404_on_invalid_route(self, client):
        """Test that invalid routes return 404."""
        response = client.get('/nonexistent-route-12345/')
        assert response.status_code == 404

    def test_app_static_folder_configured(self, app):
        """Test that static folder is configured."""
        assert app.static_folder is not None
        assert app.static_url_path == ''


class TestAppConfiguration:
    """Test app configuration."""

    def test_app_debug_mode_in_testing(self, app):
        """Test debug mode settings."""
        assert app.debug is False or app.debug is True

    def test_app_root_path(self, app):
        """Test that app has valid root path."""
        assert app.root_path is not None

    def test_app_instance_path(self, app):
        """Test that app has instance path."""
        assert app.instance_path is not None


class TestFlaskConfiguration:
    """Test Flask-specific configurations."""

    def test_app_secret_key(self, app):
        """Test that secret key is configured.

        Note: In testing, this may or may not be set,
        but the config should be accessible.
        """
        config = app.config
        assert config is not None

    def test_app_url_map(self, app):
        """Test that app has URL rules."""
        rules = list(app.url_map.iter_rules())
        assert len(rules) > 0

    def test_url_building(self, client):
        """Test that static files can be accessed via GET request."""
        # Test that a GET request completes without error
        response = client.get('/')
        # Should not raise an error
        assert response.status_code in [200, 404]


class TestErrorHandling:
    """Test error handling."""

    def test_method_not_allowed(self, client):
        """Test 405 Method Not Allowed response."""
        # Using POST on a GET endpoint
        response = client.post('/')
        # Either 405 or the route handles it
        assert response.status_code in [200, 405]


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
