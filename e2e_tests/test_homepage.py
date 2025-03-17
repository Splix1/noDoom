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

    def test_signup_button_present(self, driver, base_url):
        """Test that the signup button is present on the home page."""
        # Arrange
        home_page = HomePage(driver, base_url)
        
        # Act
        home_page.open()
        
        # Assert
        assert home_page.is_element_present(HomePage.SIGNUP_BUTTON), "Signup button should be present"
    
    @pytest.mark.skip(reason="This test requires a logged-in user")
    def test_user_profile_when_logged_in(self, driver, base_url):
        """Test that the user profile is displayed when logged in."""
        # Arrange
        home_page = HomePage(driver, base_url)
        
        # Act
        home_page.open()
        # Login with test credentials from environment variables
        home_page.login()
        
        # Assert
        assert home_page.is_logged_in(), "User should be logged in"
        
    def test_login_form_input(self, driver, base_url):
        """Test that email and password can be entered in the login form."""
        # Arrange
        home_page = HomePage(driver, base_url)
        test_email = "test@example.com"
        test_password = "password123"
        
        # Act
        home_page.open()
        home_page.enter_email(test_email)
        home_page.enter_password(test_password)
        
        # Assert
        email_element = driver.find_element(*HomePage.EMAIL_INPUT)
        password_element = driver.find_element(*HomePage.PASSWORD_INPUT)
        assert email_element.get_attribute("value") == test_email, "Email input should contain the test email"
        assert password_element.get_attribute("value") == test_password, "Password input should contain the test password"