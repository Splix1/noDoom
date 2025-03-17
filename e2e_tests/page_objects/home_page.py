"""
Home Page Object representing the main landing page of the application.
"""
from selenium.webdriver.common.by import By
from .base_page import BasePage
import os
from dotenv import load_dotenv


class HomePage(BasePage):
    """Page object for the home page"""
    
    # Locators
    TITLE = (By.CSS_SELECTOR, "h1")
    NAV_LINKS = (By.CSS_SELECTOR, "nav a")
    LOGIN_BUTTON = (By.ID, "sign-in-button")
    SIGNUP_BUTTON = (By.ID, "sign-up-button")
    EMAIL_INPUT = (By.ID, "email")
    PASSWORD_INPUT = (By.ID, "password")
    
    def __init__(self, driver, base_url="http://localhost:3000"):
        """
        Initialize the HomePage with a WebDriver instance and base URL.
        
        Args:
            driver: WebDriver instance
            base_url (str): Base URL of the application
        """
        super().__init__(driver)
        self.base_url = base_url
        # Load environment variables
        load_dotenv()
    
    def open(self):
        """
        Open the home page.
        
        Returns:
            HomePage: Self reference for method chaining
        """
        self.open_url(self.base_url)
        return self
    
    def get_page_title_text(self):
        """
        Get the main title text of the home page.
        
        Returns:
            str: Title text
        """
        return self.get_text(self.TITLE)
    
    def get_navigation_links(self):
        """
        Get all navigation links on the home page.
        
        Returns:
            list: List of navigation link elements
        """
        return self.find_elements(self.NAV_LINKS)

    def enter_email(self, email=None):
        """
        Enter email in the email input field.
        If no email is provided, uses the test email from environment variables.
        
        Args:
            email (str, optional): Email to enter. Defaults to None.
            
        Returns:
            HomePage: Self reference for method chaining
        """
        if email is None:
            email = self.get_test_email()
        
        self.wait_for_element_visible(self.EMAIL_INPUT)
        self.input_text(self.EMAIL_INPUT, email)
        return self
    
    def enter_password(self, password=None):
        """
        Enter password in the password input field.
        If no password is provided, uses the test password from environment variables.
        
        Args:
            password (str, optional): Password to enter. Defaults to None.
            
        Returns:
            HomePage: Self reference for method chaining
        """
        if password is None:
            password = self.get_test_password()
        
        self.wait_for_element_visible(self.PASSWORD_INPUT)
        self.input_text(self.PASSWORD_INPUT, password)
        return self
    
    def get_test_email(self):
        """
        Get test email from environment variables.
        
        Returns:
            str: Test email
            
        Raises:
            ValueError: If TEST_EMAIL environment variable is not set
        """
        email = os.environ.get("TEST_EMAIL")
        if not email:
            raise ValueError("TEST_EMAIL environment variable is not set")
        return email
    
    def get_test_password(self):
        """
        Get test password from environment variables.
        
        Returns:
            str: Test password
            
        Raises:
            ValueError: If TEST_PASSWORD environment variable is not set
        """
        password = os.environ.get("TEST_PASSWORD")
        if not password:
            raise ValueError("TEST_PASSWORD environment variable is not set")
        return password
    
    def login(self, email=None, password=None):
        """
        Perform login with the given credentials.
        If no credentials are provided, uses test credentials from environment variables.
        
        Args:
            email (str, optional): Email to use for login. Defaults to None.
            password (str, optional): Password to use for login. Defaults to None.
            
        Returns:
            HomePage: Self reference for method chaining
        """
        self.enter_email(email)
        self.enter_password(password)
        self.wait_for_element_clickable(self.LOGIN_BUTTON)
        self.click(self.LOGIN_BUTTON)
        return self
    
    def click_login(self):
        """
        Click the login button/link.
        
        Returns:
            HomePage: Self reference for method chaining
        """
        self.click(self.LOGIN_BUTTON)
        return self
    
    def click_signup(self):
        """
        Click the signup button/link.
        
        Returns:
            HomePage: Self reference for method chaining
        """
        self.click(self.SIGNUP_BUTTON)
        return self
    
    def is_logged_in(self):
        """
        Check if the user is logged in.
        This is a placeholder method - you'll need to customize based on your UI.
        
        Returns:
            bool: True if user is logged in, False otherwise
        """
        # This is a placeholder - replace with actual implementation
        # For example, check for a user profile icon or username display
        return False 