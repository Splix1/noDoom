"""
E2E tests for the home page.
"""
import pytest
from page_objects.home_page import HomePage


class TestHomePage:
    """Test suite for the home page."""
    
    def test_home_page_title(self, driver, base_url):
        """Test that the home page title is correct."""
        # Arrange
        home_page = HomePage(driver, base_url)
        
        # Act
        home_page.open()
        
        # Assert
        assert "noDoom" in driver.title, "Home page title should contain 'noDoom'"
    
    def test_navigation_links_present(self, driver, base_url):
        """Test that navigation links are present on the home page."""
        # Arrange
        home_page = HomePage(driver, base_url)
        
        # Act
        home_page.open()
        nav_links = home_page.get_navigation_links()
        
        # Assert
        assert len(nav_links) > 0, "Navigation links should be present on the home page"
    
    def test_login_button_present(self, driver, base_url):
        """Test that the login button is present on the home page."""
        # Arrange
        home_page = HomePage(driver, base_url)
        
        # Act
        home_page.open()
        
        # Assert
        assert home_page.is_element_present(HomePage.LOGIN_BUTTON), "Login button should be present"
    
    @pytest.mark.skip(reason="This test requires a logged-in user")
    def test_user_profile_when_logged_in(self, driver, base_url):
        """Test that the user profile is displayed when logged in."""
        # Arrange
        home_page = HomePage(driver, base_url)
        
        # Act
        home_page.open()
        # TODO: Add login steps here
        
        # Assert
        assert home_page.is_logged_in(), "User should be logged in"