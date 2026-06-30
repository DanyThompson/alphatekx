# Free deployment guide for AlphaTekx

This project now includes container files so it can run on a free Oracle Cloud VM.

## 1. Push the app to GitHub

Make sure the repo contains:
- Dockerfile.frontend
- Dockerfile.backend
- docker-compose.yml
- deploy/oci-cloud-init.yml
- deploy/deploy.sh

## 2. Create an Oracle Cloud Always Free VM

Use an Ubuntu image and enable a public IP.

### In the VM creation wizard
- Choose Ubuntu 24.04
- Open ports: 22, 80, 443
- In Advanced Options, paste the contents of deploy/oci-cloud-init.yml into User Data

## 3. SSH into the VM

```bash
ssh ubuntu@YOUR_VM_PUBLIC_IP
```

## 4. Run the deployment script

```bash
sudo chmod +x /opt/alphatekx/deploy/deploy.sh
sudo /opt/alphatekx/deploy/deploy.sh
```

## 5. Check the app

Open:
- http://YOUR_VM_PUBLIC_IP/
- http://YOUR_VM_PUBLIC_IP/health

## 6. Update environment values

Edit the VM file:

```bash
sudo nano /opt/alphatekx/.env
```

Then rebuild:

```bash
cd /opt/alphatekx
sudo docker-compose up -d --build
```

## Notes

- This is a real server deployment path, not a static-only host.
- It works best when your Supabase auth redirect URL includes the VM public URL.
- If your app still fails to sign in, add the callback URL in Supabase Auth settings:
  - http://YOUR_VM_PUBLIC_IP/auth/callback
