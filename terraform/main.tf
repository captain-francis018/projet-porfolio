#-----SECRET MONGODB-----
resource "kubernetes_secret" "mongodb" {
    metadata {
        name = "mongodb-secret"
        namespace = "default"
    }
    data = {
        password = var.mongodb_password

    }
}
#-------Mongodb pvc------------
resource "kubernetes_persistent_volume_claim" "mongodb" {
    wait_until_bound = false
    metadata {
        name = "mongodb-pvc"
        namespace = "default"
    }
    spec {
        access_modes = ["ReadWriteOnce"]
        resources {
            requests = { storage = "5Gi" }
        }
    }
}

#------Mongodb deployment------
resource "kubernetes_deployment" "mongodb" {
    metadata {
        name = "mongodb"
        namespace = "default"
    }
    spec {
        replicas = 1
        selector { match_labels = { app = "mongodb" } }
        template {
            metadata { labels = { app = "mongodb" } }
            spec {
                container {
                    name  = "mongodb"
                    image = "mongo:7"
                    port { container_port = 27017 }
                    env {
                        name  = "MONGO_INITDB_ROOT_USERNAME"
                        value = "admin"
                    }
                    env {
                        name  = "MONGO_INITDB_ROOT_PASSWORD"
                        value_from {
                            secret_key_ref {
                                name = kubernetes_secret.mongodb.metadata[0].name
                                key  = "password"
                            }
                        }
                    }
                    volume_mount {
                        name       = "data"
                        mount_path = "/data/db"
                    }
                }
                volume {
                    name = "data"
                    persistent_volume_claim {
                        claim_name = kubernetes_persistent_volume_claim.mongodb.metadata[0].name
                    }
                }
            }
        }
    }
}

#------Mongodb service------
resource "kubernetes_service" "mongodb" {
  metadata {
        name = "mongodb"
        namespace = "default"
    }
    spec {
        selector = { app = "mongodb" }
        port {
            port        = 27017
            target_port = 27017
        }
    }
}
#------Backend deployment------
resource "kubernetes_deployment" "backend" {
    metadata {
        name = "backend"
        namespace = "default"
    }
    spec {
        replicas = 1
        selector { match_labels = { app = "backend" } }
        template {
            metadata { labels = { app = "backend" } }
            spec {
                container {
                    name  = "backend"
                    image = var.backend_image
                    port { container_port = 5000 }
                    env {
                        name = "MONGO_PASSWORD"
                        value_from {
                            secret_key_ref {
                                name = kubernetes_secret.mongodb.metadata[0].name
                                key  = "password"
                            }
                        }
                    }
                    env {
                        name = "MONGODB_URI"
                        value = "mongodb://admin:$(MONGO_PASSWORD)@mongodb:27017/portfolio?authSource=admin"
                    }
                    env {
                        name  = "PORT"
                        value = "5000"
                }
            }
        }
    }
  }
depends_on = [kubernetes_deployment.mongodb]
}
#------Backend service------
resource "kubernetes_service" "backend" {
    metadata {
        name = "backend"
        namespace = "default"
    }
    spec {
        selector = { app = "backend" }
        port {
            port        = 5000
            target_port = 5000
        }
    }
}
#------Frontend deployment------
resource "kubernetes_deployment" "frontend" {
    metadata {
        name = "frontend"
        namespace = "default"
    }
    spec {
        replicas = 1
        selector { match_labels = { app = "frontend" } }
        template {
            metadata { labels = { app = "frontend" } }
            spec {
                container {
                    name  = "frontend"
                    image = var.frontend_image
                    port { container_port = 80 }

                }
            }
        }
    }
depends_on = [kubernetes_deployment.backend]
}
#------Frontend service------
resource "kubernetes_service" "frontend" {
    metadata {
        name = "frontend"
        namespace = "default"
    }
    spec {
        selector = { app = "frontend" }
        type = "NodePort"
        port {
            port        = 80
            target_port = 80
            node_port   = 30080
        }
    }
}