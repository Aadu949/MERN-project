data "aws_eks_cluster" "mern" {
  name = "mern-cluster"
}

data "aws_eks_cluster_auth" "mern" {
  name = "mern-cluster"
}

data "aws_subnet" "private_a" {
  id = "subnet-0d67d85f5656d6b8d"
}

data "aws_subnet" "private_b" {
  id = "subnet-0fc2f079aa9aa28dc"
}

data "aws_subnet" "private_c" {
  id = "subnet-0258eceb28cff9ca1"
}

resource "aws_eks_node_group" "mern_nodes" {
  cluster_name    = data.aws_eks_cluster.mern.name
  node_group_name = "mern-nodes"

  node_role_arn = aws_iam_role.eks_nodes.arn

  subnet_ids = [
    data.aws_subnet.private_a.id,
    data.aws_subnet.private_b.id,
    data.aws_subnet.private_c.id
  ]

  instance_types = ["t3.small"]

  scaling_config {
    desired_size = 1
    min_size     = 1
    max_size     = 2
  }

  depends_on = [
    aws_iam_role_policy_attachment.eks_worker_node,
    aws_iam_role_policy_attachment.eks_cni,
    aws_iam_role_policy_attachment.eks_container_registry
  ]
}

resource "aws_iam_role" "eks_nodes" {
  name = "mern-eks-node-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"

    Statement = [{
      Effect = "Allow"

      Principal = {
        Service = "ec2.amazonaws.com"
      }

      Action = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "eks_worker_node" {
  role       = aws_iam_role.eks_nodes.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
}

resource "aws_iam_role_policy_attachment" "eks_cni" {
  role       = aws_iam_role.eks_nodes.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
}

resource "aws_iam_role_policy_attachment" "eks_container_registry" {
  role       = aws_iam_role.eks_nodes.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryPullOnly"
}
