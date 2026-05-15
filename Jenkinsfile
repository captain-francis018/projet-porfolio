pipeline {
    agent any

    stages {

        // ── STAGE 1 : RÉCUPÉRATION DU CODE ───────────────────
        stage('Clone') {
            steps {
                echo "Récupération du code depuis GitHub..."

                git branch: 'main',
                    credentialsId: 'github-credentials',
                    url: 'https://github.com/captain-francis018/projet-porfolio.git'

                echo "Code récupéré "
            }
        }

        // ── STAGE 2 : BUILD DOCKER ───────────────────────────
        stage('Build') {
            steps {
                echo "Construction des images Docker..."

                sh '''
                    docker compose build
                '''

                echo "Images construites "
            }
        }

        // ── STAGE 3 : DÉPLOIEMENT ────────────────────────────
        stage('Deploy') {
            steps {

                echo "Arrêt des anciens conteneurs..."

                sh '''
                    docker compose down || true
                '''

                echo "Démarrage MongoDB..."

                sh '''
                    docker compose up -d mongodb
                '''

                sh 'sleep 15'

                echo "Démarrage Backend..."

                sh '''
                    docker compose up -d backend
                '''

                sh 'sleep 5'

                echo "Démarrage Frontend..."

                sh '''
                    docker compose up -d frontend
                '''

                sh 'sleep 5'

                echo "État des conteneurs..."

                sh '''
                    docker compose ps
                '''

                echo "Déploiement terminé "
            }
        }

        // ── STAGE 4 : HEALTH CHECK ───────────────────────────
        stage('Health Check') {
            steps {

                echo "Vérification des services..."

                sh '''
                    sleep 10

                    echo "Test API..."

                    curl -sf http://localhost/api/projects \
                        && echo "API OK " \
                        || (echo "API KO " && exit 1)

                    echo "Test Frontend..."

                    curl -sf http://localhost \
                        | grep -q "Abdoukarim" \
                        && echo "Frontend OK " \
                        || (echo "Frontend KO " && exit 1)
                '''
            }
        }
    }

    // ── POST ACTIONS ────────────────────────────────────────
    post {

        success {

            echo "Pipeline réussi — Portfolio déployé "

            emailext (
                subject: "SUCCESS - ${env.JOB_NAME} #${env.BUILD_NUMBER}",

                body: """
                <h2>Déploiement réussi </h2>

                <p><b>Projet :</b> ${env.JOB_NAME}</p>

                <p><b>Build :</b> ${env.BUILD_NUMBER}</p>

                <p><b>Statut :</b> SUCCESS</p>

                <p><b>Pipeline Jenkins :</b></p>

                <a href="${env.BUILD_URL}">
                    ${env.BUILD_URL}
                </a>

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

                <a href="${env.BUILD_URL}">
                    ${env.BUILD_URL}
                </a>

                <br><br>

                <p>Une erreur est survenue pendant le pipeline.</p>
                """,

                mimeType: 'text/html',

                to: 'abdoukarimsy018@gmail.com'
            )
        }

        always {

            echo "Nettoyage du workspace..."
//tess
            cleanWs()
        }
    }
}
