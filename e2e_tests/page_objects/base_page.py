"""
Base Page Object that all page objects will inherit from.
Contains common methods and properties used across all pages.
"""
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from selenium.webdriver.common.action_chains import ActionChains


class BasePage:
    """Base class for all page objects"""
    
    def __init__(self, driver):
        """
        Initialize the BasePage with a WebDriver instance.
        
        Args:
            driver: WebDriver instance
        """
        self.driver = driver
        self.wait = WebDriverWait(self.driver, 10)
        
    def open_url(self, url):
        """
        Open the specified URL.
        
        Args:
            url (str): URL to open
        """
        self.driver.get(url)
        
    def get_title(self):
        """
        Get the title of the current page.
        
        Returns:
            str: Page title
        """
        return self.driver.title
    
    def get_current_url(self):
        """
        Get the current URL.
        
        Returns:
            str: Current URL
        """
        return self.driver.current_url
    
    def find_element(self, locator):
        """
        Find an element using the specified locator.
        
        Args:
            locator (tuple): Locator in the format (By.XXX, 'value')
            
        Returns:
            WebElement: Found element
            
        Raises:
            NoSuchElementException: If element is not found
        """
        return self.driver.find_element(*locator)
    
    def find_elements(self, locator):
        """
        Find elements using the specified locator.
        
        Args:
            locator (tuple): Locator in the format (By.XXX, 'value')
            
        Returns:
            list: List of found elements
        """
        return self.driver.find_elements(*locator)
    
    def click(self, locator):
        """
        Click on an element.
        
        Args:
            locator (tuple): Locator in the format (By.XXX, 'value')
        """
        self.find_element(locator).click()
    
    def input_text(self, locator, text):
        """
        Input text into an element.
        
        Args:
            locator (tuple): Locator in the format (By.XXX, 'value')
            text (str): Text to input
        """
        element = self.find_element(locator)
        element.clear()
        element.send_keys(text)
    
    def is_element_present(self, locator):
        """
        Check if an element is present on the page.
        
        Args:
            locator (tuple): Locator in the format (By.XXX, 'value')
            
        Returns:
            bool: True if element is present, False otherwise
        """
        try:
            self.find_element(locator)
            return True
        except NoSuchElementException:
            return False
    
    def wait_for_element_visible(self, locator, timeout=10):
        """
        Wait for an element to be visible.
        
        Args:
            locator (tuple): Locator in the format (By.XXX, 'value')
            timeout (int): Maximum time to wait in seconds
            
        Returns:
            WebElement: The visible element
            
        Raises:
            TimeoutException: If element is not visible within timeout
        """
        wait = WebDriverWait(self.driver, timeout)
        return wait.until(EC.visibility_of_element_located(locator))
    
    def wait_for_element_clickable(self, locator, timeout=10):
        """
        Wait for an element to be clickable.
        
        Args:
            locator (tuple): Locator in the format (By.XXX, 'value')
            timeout (int): Maximum time to wait in seconds
            
        Returns:
            WebElement: The clickable element
            
        Raises:
            TimeoutException: If element is not clickable within timeout
        """
        wait = WebDriverWait(self.driver, timeout)
        return wait.until(EC.element_to_be_clickable(locator))
    
    def hover_over_element(self, locator):
        """
        Hover over an element.
        
        Args:
            locator (tuple): Locator in the format (By.XXX, 'value')
        """
        element = self.find_element(locator)
        ActionChains(self.driver).move_to_element(element).perform()
    
    def get_text(self, locator):
        """
        Get text from an element.
        
        Args:
            locator (tuple): Locator in the format (By.XXX, 'value')
            
        Returns:
            str: Text of the element
        """
        return self.find_element(locator).text
    
    def is_element_displayed(self, locator):
        """
        Check if an element is displayed.
        
        Args:
            locator (tuple): Locator in the format (By.XXX, 'value')
            
        Returns:
            bool: True if element is displayed, False otherwise
        """
        try:
            return self.find_element(locator).is_displayed()
        except NoSuchElementException:
            return False 