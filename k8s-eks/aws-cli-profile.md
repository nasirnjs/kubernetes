# AWS CLI Multiple Profile Management Guide

## Setting Up AWS CLI Profiles

Generally, `aws configure` is used to configure a default AWS profile, but this is not ideal for handling multiple accounts. You need to create separate profiles for each account.

### Step 1: Generate AWS CLI Access Key from IAM User

First, generate the access key and secret key from the IAM user in your AWS account.

### Step 2: Create Separate Profile

To create a separate profile, use the following command:

`aws configure --profile nasir-at`

### Step 3: List All AWS Profiles.

`aws configure list-profiles`

You will see a list of all configured AWS profiles. If you want to make a specific profile the default, you can export it like this.\
`export AWS_PROFILE=nasir-at`

### Step 4: Check the Active Profile
Run the following command to check which profile is currently active
`aws configure list`

### Step 5: Use a Specific Profile
`aws s3 ls --profile nasir-at`



