
# Setup AWS Cli [References](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)

```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```
Check AWS Cli version
```
aws --version
```
# Setup eksctl [References](https://docs.aws.amazon.com/eks/latest/eksctl/installation.html)

For Linux
```bash
 # for ARM systems, set ARCH to: `arm64`, `armv6` or `armv7`
ARCH=amd64
PLATFORM=$(uname -s)_$ARCH

curl -sLO "https://github.com/eksctl-io/eksctl/releases/latest/download/eksctl_$PLATFORM.tar.gz"

# (Optional) Verify checksum
curl -sL "https://github.com/eksctl-io/eksctl/releases/latest/download/eksctl_checksums.txt" | grep $PLATFORM | sha256sum --check

tar -xzf eksctl_$PLATFORM.tar.gz -C /tmp && rm eksctl_$PLATFORM.tar.gz

sudo install -m 0755 /tmp/eksctl /usr/local/bin && rm /tmp/eksctl
```

Check eksctl version
```bash
eksctl version
```





# AWS CLI Multiple Profile Management Guide

## Setting Up AWS CLI Profiles

Generally, `aws configure` is used to configure a default AWS profile, but this is not ideal for handling multiple accounts. You need to create separate profiles for each account.

**Step 1: Generate AWS CLI Access Key from IAM User.**\
First, generate the access key and secret key from the IAM user in your AWS account.

**Step 2: Create Separate Profile.**\
To create a separate profile, use the following command:\
`aws configure --profile nasir-at`

**Step 3: List All AWS Profiles.**\
`aws configure list-profiles`

**You will see a list of all configured AWS profiles. If you want to make a specific profile the default, you can export it like this.**\
`export AWS_PROFILE=nasir-at`

**Step 4: Check the Active Profile.**\
Run the following command to check which profile is currently active.\
`aws configure list`

**Step 5: Use a Specific Profile.**\
`aws s3 ls --profile nasir-at`

**Step 6: Delete AWS Cli Profile.**\
If you want to completely delete an AWS CLI profile, you need to remove it from both the `vim ~/.aws/credentials` file and the `vim ~/.aws/config` file.

When Deleting an AWS CLI Profile:
1. **In `~/.aws/credentials`:**
   - This file stores the access keys associated with your profiles.
   - You must delete the section corresponding to the profile (e.g., `[nasir-at]`).

2. **In `~/.aws/config` (if applicable):**
   - This file typically contains additional configuration settings, such as default regions and output formats.
   - If the profile has an entry here (e.g., `[profile nasir-at]`), you'll need to delete that section as well.

**Verify list of Profiles**\
`aws configure list`

**Check which AWS profile you are currently  Active Profile.**\
`echo $AWS_PROFILE`

**Conclusion**\
Managing multiple AWS CLI profiles allows you to work seamlessly across different AWS accounts and environments. By following this guide, you can easily set up, use, and delete profiles as needed. This flexibility is crucial for developers, DevOps engineers, and anyone managing resources in AWS.
