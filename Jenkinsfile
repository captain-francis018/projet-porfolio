pipeline {
    agent any

    environment {
        // Dossier du projet sur le serveur
        PROJECT_PATH = '/opt/projet-porfolio'
        // Nom du dépôt GitHub
        GITHUB_REPO  = 'https://github.com/captain-francis018/projet-porfolio.git'
    }

    stages {

        // ── STAGE 1 : RÉCUPÉRER LE CODE ──────────────────────
        stage('Clone') {
            steps {
                echo "Récupération du code depuis GitHub..."
                git branch: 'main',
                    credentialsId: 'github-credentials',
                    url: "${GITHUB_REPO}"
                echo "Code récupéré "
                sh 'ls -la'
            }
        }

        // ── STAGE 2 : TESTS ───────────────────────────────────
        stage('Test') {
            parallel {

                stage('Backend') {
                    steps {
                        dir('backend') {
                            echo "Vérification syntaxe backend..."
                            sh 'node --version'
                            sh 'npm install --omit=dev --legacy-peer-deps'
                            sh 'node --check app.js'
                            echo "Backend OK "
                        }
                    }
                }

                stage('Frontend') {
                    steps {
                        dir('frontend') {
                            echo "Build de vérification frontend..."
                            sh 'npm install --legacy-peer-deps'
                            sh 'npm run build'
                            echo "Frontend OK "
                        }
                    }
                }
            }
        }

        // ── STAGE 3 : BUILD DOCKER ────────────────────────────
        stage('Build') {
            steps {
                echo "Construction des images Docker..."
                sh '''
                    cd ${PROJECT_PATH}
                    docker compose build --no-cache
                    echo "Images construites "
                    docker image ls | grep -E "frontend|backend|mongo"
                '''
            }
        }

        // ── STAGE 4 : DÉPLOIEMENT ─────────────────────────────
        stage('Deploy') {
            steps {
                echo "Déploiement des conteneurs..."
                sh '''
                    cd ${PROJECT_PATH}

                    # Copier les fichiers mis à jour depuis le workspace Jenkins
                    cp -r ${WORKSPACE}/backend/. ${PROJECT_PATH}/backend/
                    cp -r ${WORKSPACE}/frontend/. ${PROJECT_PATH}/frontend/
                    cp ${WORKSPACE}/docker-compose.yml ${PROJECT_PATH}/docker-compose.yml

                    # Redémarrer les conteneurs
                    docker compose up --build -d

                    # Vérifier l'état
                    sleep 8
                    docker compose ps
                    echo "Déploiement terminé "
                '''
            }
        }

        // ── STAGE 5 : HEALTH CHECK ────────────────────────────
        stage('Health Check') {
            steps {
                echo "Vérification que tout répond..."
                sh '''
                    sleep 5
                    curl -sf http://localhost/api/projects \
                        && echo "API OK " \
                        || (echo "API KO " && exit 1)

                    curl -sf http://localhost \
                        | grep -q "Abdoukarim" \
                        && echo "Frontend OK " \
                        || (echo "Frontend KO " && exit 1)
                '''
            }
        }
    }

    post {
        success {
            echo "Pipeline réussi — Portfolio déployé "
        }
        failure {
            echo "Pipeline échoué — consulte les logs"
        }
        always {
            // Nettoyer le workspace après chaque build
            cleanWs()
        }
    }
}
