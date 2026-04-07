#!/bin/bash
set -e

REGION="ap-south-1"
SECRET_ID="sepm-back-secrets"

echo "Pulling secrets from AWS and creating Kubernetes secret..."
aws secretsmanager get-secret-value \
  --secret-id $SECRET_ID \
  --region $REGION \
  --query SecretString \
  --output text | \
python3 -c "
import json, sys
d = json.load(sys.stdin)
for k, v in d.items():
    k = k.strip('\"').strip()
    v = str(v).strip('\"').strip()
    print(f'{k}={v}')
" | kubectl create secret generic $SECRET_ID --from-env-file=/dev/stdin --dry-run=client -o yaml | kubectl apply -f -

echo "Deploying backend..."
kubectl apply -f back-deploy.yaml
kubectl apply -f service-back.yaml

echo "Deploying frontend..."
kubectl apply -f front-deploy.yaml
kubectl apply -f service-front.yaml

echo "Done! Checking status..."
kubectl get all
