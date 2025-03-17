"""
Base Page Object that all page objects will inherit from.
Contains common methods and properties used across all pages.
"""
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from selenium.webdriver.common.action_chains import ActionChains


class BasePage:
    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(self.driver, 10)
        
    def open_url(self, url):
        self.driver.get(url)
        
    def get_title(self):
        return self.driver.title
    
    def get_current_url(self):
        return self.driver.current_url
    
    def find_element(self, locator):
        return self.driver.find_element(*locator)
    
    def find_elements(self, locator):
        return self.driver.find_elements(*locator)
    
    def click(self, locator):
        self.find_element(locator).click()
    
    def input_text(self, locator, text):
        element = self.find_element(locator)
        element.clear()
        element.send_keys(text)
    
    def is_element_present(self, locator):
        try:
            self.find_element(locator)
            return True
        except NoSuchElementException:
            return False
    
    def wait_for_element_visible(self, locator, timeout=10):
        wait = WebDriverWait(self.driver, timeout)
        return wait.until(EC.visibility_of_element_located(locator))
    
    def wait_for_element_clickable(self, locator, timeout=10):
        wait = WebDriverWait(self.driver, timeout)
        return wait.until(EC.element_to_be_clickable(locator))

    def wait_for_url_to_change(self, timeout=10):
        wait = WebDriverWait(self.driver, timeout)
        return wait.until(EC.url_changes(self.driver.current_url))
    
    def hover_over_element(self, locator):
        element = self.find_element(locator)
        ActionChains(self.driver).move_to_element(element).perform()
    
    def get_text(self, locator):
        return self.find_element(locator).text
    
    def is_element_displayed(self, locator):
        try:
            return self.find_element(locator).is_displayed()
        except NoSuchElementException:
            return False 