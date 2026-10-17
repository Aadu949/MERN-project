resource "aws_instance" "mern_app" {
  ami                    = "ami-075701c0df5aa929c"
  instance_type          = "t3.micro"
  subnet_id              = "subnet-02231d75a8e20a362"
  key_name               = "mern-key"
  vpc_security_group_ids = ["sg-00e7a409c82da9d32"]

  tags = {
    Name = "MERN-Project"
  }

  lifecycle {
    prevent_destroy = true
  }
}
