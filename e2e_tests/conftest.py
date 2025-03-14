"""
Pytest configuration file with fixtures for E2E testing.
"""
import os
import pytest
from dotenv import load_dotenv
from utils.driver_factory import DriverFactory


# Load environment variables from .env file if it exists
load_dotenv()


def pytest_addoption(parser):
    """Add command-line options for the tests."""
    parser.addoption(
        "--browser", 
        action="store", 
        default="chrome", 
        help="Browser to run tests: chrome, firefox, or edge"
    )
    parser.addoption(
        "--headless", 
        action="store_true", 
        default=False, 
        help="Run browser in headless mode"
    )
    parser.addoption(
        "--base-url", 
        action="store", 
        default="http://localhost:3000", 
        help="Base URL of the application"
    )


@pytest.fixture(scope="session")
def base_url(request):
    """Get the base URL from command line or environment variable."""
    # Command line argument takes precedence
    base_url = request.config.getoption("--base-url")
    
    # If not provided, try to get from environment variable
    if not base_url:
        base_url = os.environ.get("BASE_URL", "http://localhost:3000")
        
    return base_url


@pytest.fixture(scope="function")
def driver(request):
    """
    Create a WebDriver instance for testing.
    
    This fixture creates a new WebDriver instance for each test function
    and automatically quits the driver after the test is complete.
    """
    browser_name = request.config.getoption("--browser")
    headless = request.config.getoption("--headless")
    
    # Create the driver
    driver = DriverFactory.get_driver(browser_name, headless)
    
    # Maximize window
    driver.maximize_window()
    
    # Return the driver to the test
    yield driver
    
    # Quit the driver after the test is complete
    driver.quit()


@pytest.fixture(scope="function")
def setup_teardown(driver, base_url):
    """
    Setup and teardown for tests.
    
    This fixture can be used to perform common setup and teardown operations
    for tests, such as navigating to the base URL before each test.
    """
    # Setup - navigate to base URL
    driver.get(base_url)
    
    # Return driver and base_url to the test
    yield driver, base_url
    
    # Teardown - any cleanup operations can go here
    # For example, delete cookies
    driver.delete_all_cookies()