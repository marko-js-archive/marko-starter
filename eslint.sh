ESLINT_ERRORS=0

echo "Running eslint..."

./node_modules/.bin/eslint .

if [ $? -ne 0 ]; then
    ESLINT_ERRORS=1
fi

if [ "$ESLINT_ERRORS" == "1" ]; then
    echo "Found eslint errors"
    exit 1
fi

echo "No eslint errors"
