#!/bin/bash

# Script to check DNS propagation for Codex domains

# Set domains to check
FRONTEND_DOMAIN="codex.silv.app"
API_DOMAIN="api.codex.silv.app"

# Function to check DNS for a domain
check_dns() {
  local domain=$1
  
  echo "Checking DNS for $domain..."
  echo "---------------------------"
  
  # Get IP address
  echo "IP Address:"
  host $domain
  echo ""
  
  # Check CNAME record
  echo "CNAME Record:"
  dig $domain CNAME
  echo ""
  
  # Check HTTP response
  echo "HTTP Response:"
  curl -I https://$domain
  echo ""
  
  echo "---------------------------"
}

# Main function
main() {
  echo "==========================="
  echo "DNS Checker for Codex Domains"
  echo "==========================="
  echo ""
  
  check_dns $FRONTEND_DOMAIN
  echo ""
  check_dns $API_DOMAIN
  
  echo "==========================="
  echo "To complete setup in Cloudflare dashboard:"
  echo "1. Create a Pages project named 'codex'"
  echo "2. Add custom domains for both services"
  echo "3. Create an R2 bucket named 'codex-content-prod'"
  echo "==========================="
}

# Run the main function
main