pipeline {
    agent any

    environment {
        PROJECT_PATH = '/opt/projet-porfolio'
    }

    stages {

        // ── STAGE 1 : RÉCUPÉRER LE CODE ──────────────────────
        stage('Clone') {
            steps {
                echo "Récupération du code depuis GitHub..."
                git branch: 'main',
                    credentialsId: 'github-credentials',
                    url: 'https://github.com/captain-francis018/projet-porfolio.git'
                echo "Code récupéré "
            }
        }

        // ── STAGE 2 : BUILD DOCKER ────────────────────────────
        stage('Build') {
            steps {
                echo "Construction des images Docker..."
                sh '''
                    cd ${PROJECT_PATH}
                    docker compose build --no-cache
                    echo "Images construites "
                '''
            }
        }

        // ── STAGE 3 : DÉPLOIEMENT ─────────────────────────────
        stage('Deploy') {
            steps {
                echo "Déploiement..."
                sh '''
                    # Copier les fichiers mis à jour depuis le workspace
                    cp -r ${WORKSPACE}/backend/. ${PROJECT_PATH}/backend/
                    cp -r ${WORKSPACE}/frontend/. ${PROJECT_PATH}/frontend/
                    cp ${WORKSPACE}/docker-compose.yml ${PROJECT_PATH}/

                    # Redémarrer les conteneurs
                    cd ${PROJECT_PATH}
                    docker compose up --build -d
                    sleep 8
                    docker compose ps
                    echo "Déployé "
                '''
            }
        }

        // ── STAGE 4 : HEALTH CHECK ────────────────────────────
        stage('Health Check') {
            steps {
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
            cleanWs()
        }
    }
}
