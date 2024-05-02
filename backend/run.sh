# Check if venv directory exists
if [ ! -d ".venv" ]; then
    echo "Creating a virtual environment..."
    python3.11 -m venv .venv
fi

# Create a static directory if it doesn't exist
mkdir -p static

# Activate the virtual environment
source .venv/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install requirements
pip install -r requirements.txt

# Run the application
flask run
