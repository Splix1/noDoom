# E2E Testing with Selenium and Python

This directory contains end-to-end (E2E) tests for the noDoom application using Selenium WebDriver and Python.

## Setup

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- Chrome, Firefox, or Edge browser installed

### Installation

1. Create a virtual environment (recommended):
   ```bash
   python -m venv venv
   ```

2. Activate the virtual environment:
   - Windows:
     ```bash
     venv\Scripts\activate
     ```
   - macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Configuration

The test configuration can be set in the following ways:

1. Environment variables in the `.env` file
2. Command-line arguments when running tests

### Environment Variables

Create or modify the `.env` file with the following variables:

```
BASE_URL=http://localhost:3000
HEADLESS=false
BROWSER=chrome
```

### Command-Line Arguments

You can override the configuration when running tests:

```bash
pytest --browser=firefox --headless --base-url=http://localhost:3000
```

## Running Tests

### Run all tests

```bash
pytest
```

### Run specific test file

```bash
pytest test_homepage.py
```

### Run specific test

```bash
pytest test_homepage.py::TestHomePage::test_home_page_title
```

### Run with HTML report

```bash
pytest --html=report.html
```

## Project Structure

```
e2e_tests/
├── conftest.py           # Pytest configuration and fixtures
├── requirements.txt      # Python dependencies
├── .env                  # Environment variables
├── test_*.py             # Test files
├── page_objects/         # Page Object Models
│   ├── __init__.py
│   ├── base_page.py      # Base Page Object class
│   └── home_page.py      # Home Page Object
└── utils/                # Utility functions and classes
    ├── __init__.py
    └── driver_factory.py # WebDriver factory
```

## Best Practices

1. **Page Object Model (POM)**: Use the Page Object pattern to separate test logic from page interactions.
2. **Explicit Waits**: Always use explicit waits instead of implicit waits or `time.sleep()`.
3. **Meaningful Assertions**: Write clear assertions with descriptive messages.
4. **Test Independence**: Each test should be independent and not rely on the state from other tests.
5. **Clean Setup/Teardown**: Use fixtures for proper setup and teardown.
6. **Descriptive Test Names**: Use descriptive test names that explain what is being tested.
7. **Avoid Hardcoding**: Use configuration files or environment variables for test data.

## Adding New Tests

1. Create a new page object in the `page_objects` directory if testing a new page.
2. Create a new test file named `test_*.py`.
3. Use the existing fixtures from `conftest.py`.
4. Follow the Arrange-Act-Assert pattern in your tests.

## Troubleshooting

- **WebDriver Issues**: Make sure you have the latest browser version installed. The WebDriver Manager should handle driver compatibility.
- **Element Not Found**: Use explicit waits and check your locators.
- **Test Flakiness**: Improve wait conditions and make locators more robust. 