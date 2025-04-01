#!/bin/bash

# Script to verify Codex deployment

# Set domains to check
FRONTEND_DOMAIN="codex.silv.app"
API_DOMAIN="api.codex.silv.app"
WORKER_DOMAIN="codex-api.silv.workers.dev"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Function to check API endpoint
check_api() {
  local domain=$1
  local endpoint=$2
  local name=$3
  
  echo -e "${YELLOW}Testing $name API at $domain$endpoint...${NC}"
  
  # Check API response
  response=$(curl -s -o /dev/null -w "%{http_code}" https://$domain$endpoint)
  
  if [ "$response" = "200" ] || [ "$response" = "201" ] || [ "$response" = "204" ]; then
    echo -e "${GREEN}✓ Success! API endpoint is responding${NC}"
    return 0
  else
    echo -e "${RED}✗ Error! API endpoint returned status $response${NC}"
    return 1
  fi
}

# Function to check frontend loading
check_frontend() {
  local domain=$1
  
  echo -e "${YELLOW}Testing frontend at $domain...${NC}"
  
  # Check frontend response
  response=$(curl -s -o /dev/null -w "%{http_code}" https://$domain)
  
  if [ "$response" = "200" ]; then
    echo -e "${GREEN}✓ Success! Frontend is loading${NC}"
    return 0
  else
    echo -e "${RED}✗ Error! Frontend returned status $response${NC}"
    return 1
  fi
}

# Function to check CORS configuration
check_cors() {
  local domain=$1
  
  echo -e "${YELLOW}Testing CORS configuration...${NC}"
  
  # Check CORS headers
  headers=$(curl -s -I -X OPTIONS https://$domain/api/health \
    -H "Origin: https://$FRONTEND_DOMAIN" \
    -H "Access-Control-Request-Method: GET" \
    -H "Access-Control-Request-Headers: Content-Type")
  
  if echo "$headers" | grep -q "Access-Control-Allow-Origin"; then
    echo -e "${GREEN}✓ Success! CORS is properly configured${NC}"
    return 0
  else
    echo -e "${RED}✗ Error! CORS headers are missing${NC}"
    echo "$headers"
    return 1
  fi
}

# Main function
main() {
  echo -e "${YELLOW}==========================${NC}"
  echo -e "${YELLOW}Codex Deployment Verification${NC}"
  echo -e "${YELLOW}==========================${NC}"
  echo ""
  
  # Check if worker domain is reachable
  echo -e "${YELLOW}Checking Worker deployment...${NC}"
  check_api $WORKER_DOMAIN "/api/health" "Worker"
  worker_status=$?
  echo ""
  
  # Check if API domain is set up
  echo -e "${YELLOW}Checking API domain...${NC}"
  check_api $API_DOMAIN "/api/health" "API"
  api_status=$?
  echo ""
  
  # Check if frontend domain is set up
  echo -e "${YELLOW}Checking Frontend domain...${NC}"
  check_frontend $FRONTEND_DOMAIN
  frontend_status=$?
  echo ""
  
  # Check CORS if both frontend and API are working
  if [ $api_status -eq 0 ] && [ $frontend_status -eq 0 ]; then
    echo -e "${YELLOW}Checking CORS configuration...${NC}"
    check_cors $API_DOMAIN
    cors_status=$?
    echo ""
  fi
  
  # Summary
  echo -e "${YELLOW}==========================${NC}"
  echo -e "${YELLOW}Verification Summary${NC}"
  echo -e "${YELLOW}==========================${NC}"
  
  if [ $worker_status -eq 0 ]; then
    echo -e "${GREEN}✓ Worker is deployed and responding${NC}"
  else
    echo -e "${RED}✗ Worker is not responding correctly${NC}"
  fi
  
  if [ $api_status -eq 0 ]; then
    echo -e "${GREEN}✓ API domain is configured and working${NC}"
  else
    echo -e "${RED}✗ API domain is not configured correctly${NC}"
  fi
  
  if [ $frontend_status -eq 0 ]; then
    echo -e "${GREEN}✓ Frontend domain is configured and working${NC}"
  else
    echo -e "${RED}✗ Frontend domain is not configured correctly${NC}"
  fi
  
  if [ $api_status -eq 0 ] && [ $frontend_status -eq 0 ]; then
    if [ $cors_status -eq 0 ]; then
      echo -e "${GREEN}✓ CORS is properly configured${NC}"
    else
      echo -e "${RED}✗ CORS is not configured correctly${NC}"
    fi
  fi
  
  echo -e "${YELLOW}==========================${NC}"
  
  # Show next steps if needed
  if [ $api_status -ne 0 ] || [ $frontend_status -ne 0 ] || [ $cors_status -ne 0 ]; then
    echo -e "${YELLOW}Next Steps:${NC}"
    
    if [ $api_status -ne 0 ]; then
      echo "1. Configure custom domain for the API in Cloudflare Workers dashboard"
      echo "   - Add api.codex.silv.app as a custom domain for the codex-api worker"
    fi
    
    if [ $frontend_status -ne 0 ]; then
      echo "2. Configure Pages project in Cloudflare dashboard"
      echo "   - Create a new project named 'codex'"
      echo "   - Add codex.silv.app as a custom domain"
      echo "   - Deploy the frontend from the dist directory"
    fi
    
    if [ $cors_status -ne 0 ] && [ $api_status -eq 0 ] && [ $frontend_status -eq 0 ]; then
      echo "3. Check CORS configuration in src/backend/middleware/cors.js"
      echo "   - Ensure productionOrigin is set to https://codex.silv.app"
      echo "   - Redeploy the worker with 'npx wrangler deploy --env production'"
    fi
  else
    echo -e "${GREEN}All checks passed! Codex is successfully deployed.${NC}"
  fi
}

# Run the main function
main