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
        sh 'cd ${PROJECT_PATH} && docker compose build'
        echo "Images construites ✓"
    }
}

        // ── STAGE 3 : DÉPLOIEMENT ─────────────────────────────
        stage('Deploy') {
    steps {
        echo "Arrêt des anciens conteneurs..."
        sh 'cd ${PROJECT_PATH} && docker compose down || true'

        echo "Démarrage des conteneurs..."
        sh 'cd ${PROJECT_PATH} && docker compose up -d mongodb'
        sh 'sleep 15'
        sh 'cd ${PROJECT_PATH} && docker compose up -d backend'
        sh 'sleep 5'
        sh 'cd ${PROJECT_PATH} && docker compose up -d frontend'
        sh 'sleep 5'
        sh 'cd ${PROJECT_PATH} && docker compose ps'
        echo "Déployé "
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
