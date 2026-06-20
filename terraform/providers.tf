terraform {
    required_version = ">= 1.5"
    required_providers {
        kubernetes = {
            source  = "hashicorp/kubernetes"
            version = "~> 2.27"
        }
    }
}

provider "kubernetes" {
    config_path = "/home/jenkins/.kube/config"
}
