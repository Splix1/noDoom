"""
Home Page Object representing the main landing page of the application.
"""
from selenium.webdriver.common.by import By
from .base_page import BasePage


class HomePage(BasePage):
    """Page object for the home page"""
    
    # Locators
    TITLE = (By.CSS_SELECTOR, "h1")
    NAV_LINKS = (By.CSS_SELECTOR, "nav a")
    LOGIN_BUTTON = (By.ID, "sign-in-button")
    SIGNUP_BUTTON = (By.ID, "sign-up-button")
    
    def __init__(self, driver, base_url="http://localhost:3000"):
        """
        Initialize the HomePage with a WebDriver instance and base URL.
        
        Args:
            driver: WebDriver instance
            base_url (str): Base URL of the application
        """
        super().__init__(driver)
        self.base_url = base_url
    
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
        user_profile_icon = (By.CSS_SELECTOR, ".user-profile-icon")
        return self.is_element_present(user_profile_icon) 