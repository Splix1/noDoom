"""
E2E tests for the forgot password functionality.
"""
import pytest
from page_objects.home_page import HomePage
from page_objects.forgot_password_page import ForgotPasswordPage


class TestForgotPassword:
    
    def test_navigate_to_forgot_password_page(self, driver):
        # Arrange
        home_page = HomePage(driver)
        home_page.open()

        # Act
        home_page.click_forgot_password()
        home_page.wait_for_url_to_change()
        
        # Assert
        current_url = driver.current_url
        assert "/forgot-password" in current_url, "Should navigate to the forgot password page"
    
    def test_forgot_password_page_title(self, driver):
        # Arrange
        forgot_password_page = ForgotPasswordPage(driver)
        forgot_password_page.open()
        
        # Assert
        page_title = forgot_password_page.get_page_title_text()
        assert "Reset Password" in page_title, "Page title should contain 'Reset Password'"
    
    def test_reset_password_button_present(self, driver):
        # Arrange
        forgot_password_page = ForgotPasswordPage(driver)
        
        # Act
        forgot_password_page.open()
        
        # Assert
        assert forgot_password_page.is_element_present(ForgotPasswordPage.RESET_PASSWORD_BUTTON), "Reset password button should be present"
    
    def test_email_input_present(self, driver):
        # Arrange
        forgot_password_page = ForgotPasswordPage(driver)
        
        # Act
        forgot_password_page.open()
        
        # Assert
        assert forgot_password_page.is_element_present(ForgotPasswordPage.EMAIL_INPUT), "Email input should be present"
    
    def test_submit_reset_password_request(self, driver):
        # Arrange
        forgot_password_page = ForgotPasswordPage(driver)
        test_email = "test@example.com"
        
        # Act
        forgot_password_page.open()
        forgot_password_page.submit_reset_password_request(test_email)
        
        # Assert
        assert forgot_password_page.get_success_message() == "Check your email for a link to reset your password.", "Reset password request should be submitted successfully" 