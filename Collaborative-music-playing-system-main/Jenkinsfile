pipeline {
  agent any
  
  environment {
    AWS_ACCESS_KEY_ID = credentials('aws-access-key')
    AWS_SECRET_ACCESS_KEY = credentials('aws-secret-access-key')
    KUBECONFIG = credentials('kubeconfig-eks')
  }

  stages{

    stage('Docker Image Build Stage'){
      steps{
        dir('frontend'){
          sh 'docker build -t dockerayush039/sepmfront .'
        }
        dir('backend'){
          sh 'docker build -t dockerayush039/sepmback .'
        }
      }
    }


    stage('Login to Docker Hub'){
      steps{
        withCredentials([
          usernamePassword(
            credentialsId: 'docker-creds',
            usernameVariable: 'USERNAME',
            passwordVariable: 'PASSWORD'
          )
        ]) {
          sh 'echo $PASSWORD | docker login -u $USERNAME --password-stdin'
        }
      }
    }


    stage('Push Image to DockerHub'){
      steps{
        sh 'docker push dockerayush039/sepmfront'
        sh 'docker push dockerayush039/sepmback'
      }
    }


    stage('Deploy to EKS'){
      steps{
        dir('kube'){
          sh 'bash secrets.sh'
        }
      }
    }
  }
}
