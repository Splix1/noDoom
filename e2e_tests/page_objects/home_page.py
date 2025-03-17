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
    FORGOT_PASSWORD_BUTTON = (By.ID, "forgot-password-button")

    def __init__(self, driver, base_url="http://localhost:3000"):
        super().__init__(driver)
        self.base_url = base_url
        # Load environment variables
        load_dotenv()
    
    def open(self):
        self.open_url(self.base_url)
        return self
    
    def get_page_title_text(self):
        return self.get_text(self.TITLE)
    
    def get_navigation_links(self):
        return self.find_elements(self.NAV_LINKS)

    def enter_email(self, email=None):
        if email is None:
            email = self.get_test_email()
        
        self.wait_for_element_visible(self.EMAIL_INPUT)
        self.input_text(self.EMAIL_INPUT, email)
        return self
    
    def enter_password(self, password=None):
        if password is None:
            password = self.get_test_password()
        
        self.wait_for_element_visible(self.PASSWORD_INPUT)
        self.input_text(self.PASSWORD_INPUT, password)
        return self
    
    def get_test_email(self):
        email = os.environ.get("TEST_EMAIL")
        if not email:
            raise ValueError("TEST_EMAIL environment variable is not set")
        return email
    
    def get_test_password(self):
        password = os.environ.get("TEST_PASSWORD")
        if not password:
            raise ValueError("TEST_PASSWORD environment variable is not set")
        return password
    
    def login(self, email=None, password=None):
        self.enter_email(email)
        self.enter_password(password)
        self.wait_for_element_clickable(self.LOGIN_BUTTON)
        self.click(self.LOGIN_BUTTON)
        return self
    
    def click_login(self):
        self.click(self.LOGIN_BUTTON)
        return self
    
    def click_signup(self):
        self.click(self.SIGNUP_BUTTON)
        return self
    
    def is_logged_in(self):
        # This is a placeholder - replace with actual implementation
        # For example, check for a user profile icon or username display
        return False 
    
    def click_forgot_password(self):
        self.wait_for_element_clickable(self.FORGOT_PASSWORD_BUTTON)
        self.click(self.FORGOT_PASSWORD_BUTTON)
        return self
