# Installing DigitalOcean doctl & Connect with K8 Cluster

### Using a Package Manager

Snap supported OS, Use Snap on Snap-supported systems to install doctl:

`sudo snap install doctl`

### Downloading a Release from GitHub

Visit the [Releases page](https://github.com/digitalocean/doctl/releases) for the [`doctl` GitHub project](https://github.com/digitalocean/doctl), and find the appropriate archive for your operating system and architecture. Download the archive from your browser or copy its URL and retrieve it to your home directory with `wget` or `curl`.

For example, with `wget`: \
`wget https://github.com/digitalocean/doctl/releases/download/v1.93.1/doctl-1.93.1-linux-amd64.tar.gz`  \
`sudo tar -xvf doctl-1.93.1-linux-amd64.tar.gz` \
`sudo mv doctl /usr/local/bin/` \
`docker version`
  
## Authenticating with DigitalOcean
To use `doctl`, you need to authenticate with DigitalOcean by providing an access token, which can be created from the [Applications & API](https://cloud.digitalocean.com/account/api/tokens) section of the Control Panel. You can learn how to generate a token by following the [DigitalOcean API guide](https://www.digitalocean.com/community/tutorials/how-to-use-the-digitalocean-api-v2).
- Log in to your DigitalOcean account and navigate to the API section by clicking on the "API" link in the top navigation menu.
- In the "Personal access tokens" section, click on the "Generate New Token" button to create a new token.
- Enter a name for the new token and select the appropriate scopes for the token based on the operations you will be performing with `doctl`.
- Click on the "Generate Token" button to generate the token.

`doctl auth init --access-token YOUR_ACCESS_TOKEN`


After entering your token, you will receive confirmation that the credentials were accepted. If the token doesn't validate, make sure you copied and pasted it correctly.

`Validating token: OK`

This will create the necessary directory structure and configuration file to store your credentials.

***Replace `YOUR_ACCESS_TOKEN` with the token value that you just generated in step*** \
`doctl auth init --access-token YOUR_ACCESS_TOKEN`

Lists regions that support DigitalOcean Kubernetes clusters.\
`doctl compute region list`


[doks cmd](https://docs.digitalocean.com/reference/doctl/reference/kubernetes/cluster/)

[doctl comd](https://docs.digitalocean.com/reference/doctl/reference/kubernetes/cluster/)

---