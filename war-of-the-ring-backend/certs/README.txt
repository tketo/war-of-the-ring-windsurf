For development, you'll need to generate self-signed certificates:

1. Install OpenSSL if not already installed
2. Run the following commands in this directory:
   - openssl genrsa -out key.pem 2048
   - openssl req -new -key key.pem -out csr.pem
   - openssl x509 -req -days 365 -in csr.pem -signkey key.pem -out cert.pem

For production, use proper certificates from a trusted Certificate Authority.
