pipeline {
    agent any

    environment {
        DOCKERHUB_USER  = 'rimka03'
        IMAGE_BACKEND   = "${DOCKERHUB_USER}/portfolio-backend"
        IMAGE_FRONTEND  = "${DOCKERHUB_USER}/portfolio-frontend"
        IMAGE_TAG       = "${env.BUILD_NUMBER}"
        KUBECONFIG      = '/etc/rancher/k3s/k3s.yaml'
        SONAR_URL       = 'http://192.168.30.20:9000'
    }

    stages {

        // ── STAGE 1 : CLONE ──────────────────────────────────
        stage('Clone') {
            steps {
                echo "Récupération du code depuis GitHub..."
                git branch: 'main',
                    credentialsId: 'github-credentials',
                    url: 'https://github.com/captain-francis018/projet-porfolio.git'
                echo "Code récupéré ✅"
            }
        }

        // ── STAGE 2 : SONARQUBE ──────────────────────────────
        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('sonarqube-server') {
                    withCredentials([string(credentialsId: 'sonarqube-token', variable: 'SONAR_TOKEN')]) {
                        sh '''
                            cd backend
                            npx sonar-scanner \
                                -Dsonar.projectKey=portfolio-backend \
                                -Dsonar.sources=. \
                                -Dsonar.exclusions=node_modules/**,coverage/** \
                                -Dsonar.host.url=$SONAR_URL \
                                -Dsonar.login=$SONAR_TOKEN
                            cd ..
                            cd frontend
                            npx sonar-scanner \
                                -Dsonar.projectKey=portfolio-frontend \
                                -Dsonar.sources=src \
                                -Dsonar.exclusions=node_modules/**,dist/** \
                                -Dsonar.host.url=$SONAR_URL \
                                -Dsonar.login=$SONAR_TOKEN
                            cd ..
                        '''
                    }
                }
                echo "Analyse terminée ✅"
            }
        }

        // ── STAGE 3 : QUALITY GATE ───────────────────────────
        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
                echo "Quality Gate passé ✅"
            }
        }

        // ── STAGE 4 : BUILD ──────────────────────────────────
        stage('Build') {
            steps {
                echo "Construction des images Docker..."
                sh 'docker compose build'
                echo "Images construites ✅"
            }
        }

        // ── STAGE 5 : PUSH DOCKER HUB ────────────────────────
        stage('Push Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-credentials',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin

                        BACKEND_IMAGE=$(docker compose config --images | grep backend | head -1)
                        FRONTEND_IMAGE=$(docker compose config --images | grep frontend | head -1)

                        docker tag $BACKEND_IMAGE $IMAGE_BACKEND:$IMAGE_TAG
                        docker tag $BACKEND_IMAGE $IMAGE_BACKEND:latest
                        docker push $IMAGE_BACKEND:$IMAGE_TAG
                        docker push $IMAGE_BACKEND:latest

                        docker tag $FRONTEND_IMAGE $IMAGE_FRONTEND:$IMAGE_TAG
                        docker tag $FRONTEND_IMAGE $IMAGE_FRONTEND:latest
                        docker push $IMAGE_FRONTEND:$IMAGE_TAG
                        docker push $IMAGE_FRONTEND:latest

                        docker logout
                    '''
                }
                echo "Images publiées ✅"
            }
        }

        // ── STAGE 6 : DEPLOY KUBERNETES ──────────────────────
        stage('Deploy') {
            steps {
                echo "Déploiement sur Kubernetes..."
                sh '''
                    # Appliquer les manifests
                    kubectl apply -f k8s/mongodb-secret.yaml
                    kubectl apply -f k8s/mongodb.yaml
                    kubectl apply -f k8s/backend.yaml
                    kubectl apply -f k8s/frontend.yaml

                    # Forcer le rechargement des images latest
                    kubectl rollout restart deployment/backend
                    kubectl rollout restart deployment/frontend

                    # Attendre que les déploiements soient prêts
                    kubectl rollout status deployment/backend --timeout=120s
                    kubectl rollout status deployment/frontend --timeout=120s
                '''
                echo "Déploiement terminé ✅"
            }
        }

        // ── STAGE 7 : HEALTH CHECK ───────────────────────────
        stage('Health Check') {
            steps {
                sh '''
                    sleep 10
                    kubectl get pods
                    kubectl get services

                    echo "Test API..."
                    curl -sf http://localhost:30080/api/projects \
                        && echo "API OK ✅" \
                        || (echo "API KO ❌" && exit 1)
                '''
            }
        }
    }

    post {
        success {
            echo "Pipeline réussi ✅"
            emailext(
                subject: "SUCCESS - ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: """
                <h2>Déploiement réussi ✅</h2>
                <p><b>Build :</b> ${env.BUILD_NUMBER}</p>
                <p><b>Images :</b> rimka03/portfolio-backend:${env.BUILD_NUMBER}</p>
                <a href="${env.BUILD_URL}">${env.BUILD_URL}</a>
                """,
                mimeType: 'text/html',
                to: 'abdoukarimsy018@gmail.com'
            )
        }
        failure {
            echo "Pipeline échoué ❌"
            emailext(
                subject: "FAILURE - ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: """
                <h2>Déploiement échoué ❌</h2>
                <p><b>Build :</b> ${env.BUILD_NUMBER}</p>
                <a href="${env.BUILD_URL}">${env.BUILD_URL}</a>
                """,
                mimeType: 'text/html',
                to: 'abdoukarimsy018@gmail.com'
            )
        }
        always {
            cleanWs()
        }
    }
}
