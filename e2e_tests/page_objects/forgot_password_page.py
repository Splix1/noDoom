"""
Forgot Password Page Object representing the password reset page.
"""
from selenium.webdriver.common.by import By
from .base_page import BasePage


class ForgotPasswordPage(BasePage):
    # Locators
    PAGE_TITLE = (By.CSS_SELECTOR, "h1")
    EMAIL_INPUT = (By.ID, "email")
    RESET_PASSWORD_BUTTON = (By.ID, "reset-password-button")
    SUCCESS_MESSAGE = (By.ID, "success-message")

    def __init__(self, driver, base_url="http://localhost:3000/forgot-password"):
        super().__init__(driver)
        self.base_url = base_url
    
    def open(self):
        self.open_url(self.base_url)
        return self
    
    def get_page_title_text(self):
        return self.get_text(self.PAGE_TITLE)
    
    def enter_email(self, email):
        self.wait_for_element_visible(self.EMAIL_INPUT)
        self.input_text(self.EMAIL_INPUT, email)
        return self
    
    def click_reset_password(self):
        self.wait_for_element_clickable(self.RESET_PASSWORD_BUTTON)
        self.click(self.RESET_PASSWORD_BUTTON)
        return self

    def get_success_message(self):
        self.wait_for_element_visible(self.SUCCESS_MESSAGE)
        return self.get_text(self.SUCCESS_MESSAGE)
    
    def submit_reset_password_request(self, email):
        self.enter_email(email)
        self.click_reset_password()
        return self 