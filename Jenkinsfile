pipeline {
    agent any

    stages {

        stage('Install Client Dependencies') {
            steps {
                dir('client') {
                    sh 'npm ci'
                }
            }
        }

        stage('Lint Client') {
            steps {
                dir('client') {
                    sh 'npm run lint'
                }
            }
        }

        stage('Build Client') {
            steps {
                dir('client') {
                    sh 'npm run build'
                }
            }
        }

        stage('Install Server Dependencies') {
            steps {
                dir('server') {
                    sh 'npm ci'
                }
            }
        }

        stage('Docker Check') {
            steps {
                sh 'docker --version'
            }
        }
    }
}
