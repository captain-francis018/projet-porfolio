pipeline {
    agent any

    environment {
        DOCKERHUB_USER  = 'rimka03'
        IMAGE_BACKEND   = "${DOCKERHUB_USER}/portfolio-backend"
        IMAGE_FRONTEND  = "${DOCKERHUB_USER}/portfolio-frontend"
        IMAGE_TAG       = "${env.BUILD_NUMBER}"
        SONAR_URL       = 'http://192.168.30.20:9000'
        KUBECONFIG      = '/etc/rancher/k3s/k3s.yaml'

        // Variables Terraform (TF_VAR_* lues automatiquement par Terraform)
        TF_VAR_mongodb_password = credentials('mongodb-password')
        TF_VAR_backend_image    = "${DOCKERHUB_USER}/portfolio-backend:${env.BUILD_NUMBER}"
        TF_VAR_frontend_image   = "${DOCKERHUB_USER}/portfolio-frontend:${env.BUILD_NUMBER}"
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

        // ── STAGE 2 : SONARQUBE ANALYSIS ─────────────────────
        stage('SonarQube Analysis') {
            steps {
                echo "Analyse qualité du code..."

                withSonarQubeEnv('sonarqube-server') {
                    withCredentials([string(credentialsId: 'sonarqube-token', variable: 'SONAR_TOKEN')]) {
                        sh '''
                            cd backend
                            /usr/bin/npx sonar-scanner \
                                -Dsonar.projectKey=portfolio-backend \
                                -Dsonar.projectName="Portfolio Backend" \
                                -Dsonar.sources=. \
                                -Dsonar.exclusions=node_modules/**,coverage/** \
                                -Dsonar.host.url=$SONAR_URL \
                                -Dsonar.login=$SONAR_TOKEN
                            cd ..

                            cd frontend
                            /usr/bin/npx sonar-scanner \
                                -Dsonar.projectKey=portfolio-frontend \
                                -Dsonar.projectName="Portfolio Frontend" \
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
                echo "Vérification Quality Gate..."

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

        // ── STAGE 5 : TRIVY SCAN - CODE SOURCE ───────────────
        stage('Trivy Scan - Code Source') {
            steps {
                echo "Scan des dépendances npm (backend + frontend)..."

                sh '''
                    mkdir -p trivy-reports

                    # Rapport complet (informatif, ne bloque jamais)
                    trivy fs --severity LOW,MEDIUM,HIGH,CRITICAL \
                        --format json -o trivy-reports/fs-backend.json \
                        --exit-code 0 \
                        backend/

                    trivy fs --severity LOW,MEDIUM,HIGH,CRITICAL \
                        --format json -o trivy-reports/fs-frontend.json \
                        --exit-code 0 \
                        frontend/

                    # Bloque uniquement si une faille CRITICAL est trouvée
                    trivy fs --severity CRITICAL \
                        --exit-code 1 \
                        backend/
		    trivy fs --severity CRITICAL \
                        --exit-code 1 \
                        frontend/
                '''

                echo "Scan code source terminé ✅"
            }
        }

        // ── STAGE 6 : TRIVY SCAN - MANIFESTS K8S ─────────────
        stage('Trivy Scan - Kubernetes Manifests') {
            steps {
                echo "Scan des manifests Kubernetes et Terraform..."

                sh '''
                    trivy config --severity LOW,MEDIUM,HIGH,CRITICAL \
                        --format json -o trivy-reports/k8s-config.json \
                        --exit-code 0 \
                        k8s/

                    trivy config --severity LOW,MEDIUM,HIGH,CRITICAL \
                        --format json -o trivy-reports/k8s-config.json \
                        --exit-code 0 \
                        terraform/

                    trivy config --severity CRITICAL \
                        --exit-code 1 \
                        k8s/
		    trivy config --severity CRITICAL \
                        --exit-code 1 \
                        terraform/
                '''

                echo "Scan manifests terminé ✅"
            }
        }

        // ── STAGE 7 : TRIVY SCAN - IMAGES DOCKER ─────────────
        stage('Trivy Scan - Docker Images') {
            steps {
                echo "Scan des images Docker construites..."

                sh '''
                    BACKEND_IMAGE=$(docker compose config --images | grep backend | head -1)
                    FRONTEND_IMAGE=$(docker compose config --images | grep frontend | head -1)

                    echo "Backend image  : $BACKEND_IMAGE"
                    echo "Frontend image : $FRONTEND_IMAGE"

                    # Rapport complet (informatif, ne bloque jamais)
                    trivy image --severity LOW,MEDIUM,HIGH,CRITICAL \
                        --format json -o trivy-reports/image-backend.json \
                        --exit-code 0 \
                        --ignore-unfixed \
                        $BACKEND_IMAGE

                    trivy image --severity LOW,MEDIUM,HIGH,CRITICAL \
                        --format json -o trivy-reports/image-frontend.json \
                        --exit-code 0 \
                        --ignore-unfixed \
                        $FRONTEND_IMAGE

                    # Bloque uniquement sur CRITICAL avec correctif disponible
                    trivy image --severity CRITICAL \
                        --exit-code 1 \
                        --ignore-unfixed \
                        $BACKEND_IMAGE

                    trivy image --severity CRITICAL \
                        --exit-code 1 \
                        --ignore-unfixed \
                        $FRONTEND_IMAGE
                '''

                echo "Scan images Docker terminé ✅"
            }
            post {
                always {
                    archiveArtifacts artifacts: 'trivy-reports/*.json', allowEmptyArchive: true
                }
            }
        }

        // ── STAGE 8 : PUSH DOCKER HUB ─────────────────────────
        stage('Push Docker Hub') {
            steps {
                echo "Publication des images sur Docker Hub..."

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

                echo "Images publiées sur Docker Hub ✅"
            }
        }

        // ── STAGE 9 : TERRAFORM INIT ──────────────────────────
        stage('Terraform Init') {
            steps {
                echo "Initialisation Terraform..."

                sh '''
                    cd terraform
                    terraform init
                '''

                echo "Terraform initialisé ✅"
            }
        }

        // ── STAGE 10 : TERRAFORM PLAN ─────────────────────────
        stage('Terraform Plan') {
            steps {
                echo "Planification de l'infrastructure..."

                sh '''
                    cd terraform
                    terraform plan -out=tfplan
                '''

                echo "Plan généré ✅"
            }
        }

        // ── STAGE 11 : TERRAFORM APPLY ────────────────────────
        stage('Terraform Apply') {
            steps {
                echo "Déploiement de l'infrastructure..."

                sh '''
                    cd terraform
                    terraform apply -auto-approve tfplan
                '''

                echo "Infrastructure déployée ✅"
            }
        }

        // ── STAGE 12 : HEALTH CHECK ───────────────────────────
        stage('Health Check') {
            steps {
                echo "Vérification des services..."

                sh '''
                    sleep 20

                    echo "Pods en cours..."
                    /usr/local/bin/kubectl get pods

                    echo "Services..."
                    /usr/local/bin/kubectl get services

                    echo "Test API..."
                    curl -sf http://192.168.30.20:30080/api/projects \
                        && echo "API OK ✅" \
                        || (echo "API KO ❌" && exit 1)

                    echo "Test Frontend..."
                    curl -sf http://192.168.30.20:30080 \
                        | grep -q "Abdoukarim" \
                        && echo "Frontend OK ✅" \
                        || (echo "Frontend KO ❌" && exit 1)
                '''
            }
        }
    }

    // ── POST ACTIONS ─────────────────────────────────────────
    post {

        success {
            echo "Pipeline réussi — Portfolio déployé ✅"

            emailext (
                subject: "SUCCESS - ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: """
                <h2>Déploiement réussi ✅</h2>
                <p><b>Projet :</b> ${env.JOB_NAME}</p>
                <p><b>Build :</b> ${env.BUILD_NUMBER}</p>
                <p><b>Statut :</b> SUCCESS</p>
                <p><b>Images Docker Hub :</b></p>
                <ul>
                    <li>rimka03/portfolio-backend:${env.BUILD_NUMBER}</li>
                    <li>rimka03/portfolio-frontend:${env.BUILD_NUMBER}</li>
                </ul>
                <p><b>Sécurité :</b> Scans SonarQube + Trivy passés (aucune faille CRITICAL)</p>
                <p><b>Infrastructure :</b> Terraform apply réussi</p>
                <p><b>Pipeline Jenkins :</b></p>
                <a href="${env.BUILD_URL}">${env.BUILD_URL}</a>
                <br><br>
                <p>Le portfolio a été déployé avec succès.</p>
                """,
                mimeType: 'text/html',
                to: 'abdoukarimsy018@gmail.com'
            )
        }

        failure {
            echo "Pipeline échoué — consulte les logs "

            emailext (
                subject: "FAILURE - ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: """
                <h2>Déploiement échoué </h2>
                <p><b>Projet :</b> ${env.JOB_NAME}</p>
                <p><b>Build :</b> ${env.BUILD_NUMBER}</p>
                <p><b>Statut :</b> FAILURE</p>
                <p><b>Consulter les logs Jenkins :</b></p>
                <a href="${env.BUILD_URL}">${env.BUILD_URL}</a>
                <br><br>
                <p>Une erreur est survenue pendant le pipeline (build, scan sécurité,
                Quality Gate, ou déploiement). Vérifier les logs et les rapports
                Trivy archivés pour identifier la cause.</p>
                """,
                mimeType: 'text/html',
                to: 'abdoukarimsy018@gmail.com'
            )
        }

        always {
            echo "Nettoyage du workspace..."
            cleanWs()
        }
    }
}

