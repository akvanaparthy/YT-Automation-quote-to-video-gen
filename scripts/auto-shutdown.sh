#!/bin/bash
# Auto-shutdown script for DigitalOcean droplet
# This script will shutdown the droplet after n8n workflows complete

echo "Waiting 10 minutes for n8n workflows to complete..."
sleep 600

echo "Shutting down droplet to save costs..."
shutdown -h now
