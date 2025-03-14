"""
WebDriver factory to create and configure browser instances for testing.
"""
from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.firefox.service import Service as FirefoxService
from selenium.webdriver.edge.service import Service as EdgeService
from webdriver_manager.chrome import ChromeDriverManager
from webdriver_manager.firefox import GeckoDriverManager
from webdriver_manager.microsoft import EdgeChromiumDriverManager
import os
import platform


class DriverFactory:
    """
    Factory class for creating WebDriver instances with proper configuration.
    """
    
    @staticmethod
    def get_driver(browser_name="chrome", headless=False):
        """
        Create and return a WebDriver instance based on the specified browser.
        
        Args:
            browser_name (str): Name of the browser ('chrome', 'firefox', or 'edge')
            headless (bool): Whether to run the browser in headless mode
            
        Returns:
            WebDriver: Configured WebDriver instance
        """
        browser_name = browser_name.lower()
        
        if browser_name == "chrome":
            options = webdriver.ChromeOptions()
            if headless:
                options.add_argument("--headless=new")
            options.add_argument("--start-maximized")
            options.add_argument("--disable-extensions")
            options.add_argument("--disable-gpu")
            options.add_argument("--no-sandbox")
            options.add_argument("--disable-dev-shm-usage")
            
            # For Windows, use a simpler approach
            if platform.system() == "Windows":
                try:
                    driver = webdriver.Chrome(options=options)
                except Exception as e:
                    print(f"Error creating Chrome driver with default approach: {e}")
                    # Fallback to WebDriver Manager
                    driver = webdriver.Chrome(
                        service=ChromeService(ChromeDriverManager().install()),
                        options=options
                    )
            else:
                driver = webdriver.Chrome(
                    service=ChromeService(ChromeDriverManager().install()),
                    options=options
                )
            
        elif browser_name == "firefox":
            options = webdriver.FirefoxOptions()
            if headless:
                options.add_argument("--headless")
            
            if platform.system() == "Windows":
                try:
                    driver = webdriver.Firefox(options=options)
                except Exception as e:
                    print(f"Error creating Firefox driver with default approach: {e}")
                    # Fallback to WebDriver Manager
                    driver = webdriver.Firefox(
                        service=FirefoxService(GeckoDriverManager().install()),
                        options=options
                    )
            else:
                driver = webdriver.Firefox(
                    service=FirefoxService(GeckoDriverManager().install()),
                    options=options
                )
                
        elif browser_name == "edge":
            options = webdriver.EdgeOptions()
            if headless:
                options.add_argument("--headless")
            
            if platform.system() == "Windows":
                try:
                    driver = webdriver.Edge(options=options)
                except Exception as e:
                    print(f"Error creating Edge driver with default approach: {e}")
                    # Fallback to WebDriver Manager
                    driver = webdriver.Edge(
                        service=EdgeService(EdgeChromiumDriverManager().install()),
                        options=options
                    )
            else:
                driver = webdriver.Edge(
                    service=EdgeService(EdgeChromiumDriverManager().install()),
                    options=options
                )
            
        else:
            raise ValueError(f"Unsupported browser: {browser_name}")
        
        # Set implicit wait time
        driver.implicitly_wait(10)
        
        return driver 