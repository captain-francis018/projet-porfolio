pipeline {
    agent any

    environment {
        DOCKERHUB_USER = 'rimka03'
        IMAGE_BACKEND   = "${DOCKERHUB_USER}/portfolio-backend"
        IMAGE_FRONTEND  = "${DOCKERHUB_USER}/portfolio-frontend"
        IMAGE_TAG       = "${env.BUILD_NUMBER}"
    }

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

        // ── STAGE 3 : PUSH DOCKER HUB ────────────────────────
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

                # Récupérer dynamiquement les noms des images buildées
                BACKEND_IMAGE=$(docker compose images -q backend | xargs docker inspect --format='{{index .RepoTags 0}}' | cut -d: -f1)
                FRONTEND_IMAGE=$(docker compose images -q frontend | xargs docker inspect --format='{{index .RepoTags 0}}' | cut -d: -f1)

                echo "Backend image détectée : $BACKEND_IMAGE"
                echo "Frontend image détectée : $FRONTEND_IMAGE"

                # Tag et push Backend
                docker tag $BACKEND_IMAGE $IMAGE_BACKEND:$IMAGE_TAG
                docker tag $BACKEND_IMAGE $IMAGE_BACKEND:latest
                docker push $IMAGE_BACKEND:$IMAGE_TAG
                docker push $IMAGE_BACKEND:latest

                # Tag et push Frontend
                docker tag $FRONTEND_IMAGE $IMAGE_FRONTEND:$IMAGE_TAG
                docker tag $FRONTEND_IMAGE $IMAGE_FRONTEND:latest
                docker push $IMAGE_FRONTEND:$IMAGE_TAG
                docker push $IMAGE_FRONTEND:latest

                docker logout
            '''
        }

        echo "Images publiées sur Docker Hub "
    }
}

        // ── STAGE 4 : DÉPLOIEMENT ────────────────────────────
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

        // ── STAGE 5 : HEALTH CHECK ───────────────────────────
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

                <p><b>Images Docker Hub :</b></p>
                <ul>
                    <li>captainfrancis018/portfolio-backend:${env.BUILD_NUMBER}</li>
                    <li>captainfrancis018/portfolio-frontend:${env.BUILD_NUMBER}</li>
                </ul>

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

            cleanWs()
        }
    }
}
