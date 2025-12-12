locals {
  project_name = "automation-support-bot"
}

resource "aws_cognito_user_pool" "app" {
  name = "${local.project_name}-${var.environment}"

  auto_verified_attributes = ["email"]

  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_numbers   = true
    require_symbols   = false
    require_uppercase = true
  }
}

resource "aws_cognito_user_pool_client" "spa" {
  name                                 = "${local.project_name}-${var.environment}-spa"
  user_pool_id                         = aws_cognito_user_pool.app.id
  supported_identity_providers         = ["COGNITO"]
  generate_secret                      = false
  callback_urls                        = var.cognito_callback_urls
  logout_urls                          = var.cognito_logout_urls
  prevent_user_existence_errors        = "ENABLED"
  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_flows                  = ["code"]
  allowed_oauth_scopes                 = ["email", "openid", "profile"]

  explicit_auth_flows = [
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_PASSWORD_AUTH"
  ]
}

resource "aws_cognito_user_pool_domain" "app" {
  domain       = "${local.project_name}-${var.environment}-${random_id.cognito_suffix.hex}"
  user_pool_id = aws_cognito_user_pool.app.id
}

resource "random_id" "cognito_suffix" {
  byte_length = 4
}

resource "aws_dynamodb_table" "sessions" {
  name         = "${local.project_name}-${var.environment}-sessions"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "sessionId"
  range_key    = "sortKey"

  attribute {
    name = "sessionId"
    type = "S"
  }

  attribute {
    name = "sortKey"
    type = "S"
  }

  ttl {
    attribute_name = "expiresAt"
    enabled        = true
  }

  stream_enabled   = true
  stream_view_type = "NEW_AND_OLD_IMAGES"
}

resource "aws_iam_role" "lambda_role" {
  name = "${local.project_name}-${var.environment}-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Principal = { Service = "lambda.amazonaws.com" }
      Effect    = "Allow"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "lambda_policy" {
  name = "${local.project_name}-${var.environment}-lambda-inline"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:UpdateItem", "dynamodb:Query"]
        Resource = aws_dynamodb_table.sessions.arn
      },
      {
        Effect   = "Allow"
        Action   = ["events:PutEvents"]
        Resource = aws_cloudwatch_event_bus.automation.arn
      },
      {
        Effect   = "Allow"
        Action   = ["ses:SendEmail", "ses:SendRawEmail"]
        Resource = "*"
        Condition = {
          StringLike = {
            "ses:FromAddress" = var.ses_from_address
          }
        }
      }
    ]
  })
}

resource "aws_iam_role" "eventbridge_invoke" {
  name = "${local.project_name}-${var.environment}-eventbridge-invoke"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Principal = { Service = "events.amazonaws.com" }
      Effect    = "Allow"
    }]
  })
}

resource "aws_iam_role_policy" "eventbridge_invoke_policy" {
  name = "${local.project_name}-${var.environment}-eventbridge-invoke-inline"
  role = aws_iam_role.eventbridge_invoke.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["lambda:InvokeFunction"]
      Resource = aws_lambda_function.reminder_dispatcher.arn
    }]
  })
}

resource "aws_cloudwatch_event_bus" "automation" {
  name = "${local.project_name}-${var.environment}-bus"
}

data "archive_file" "chat_handler" {
  type        = "zip"
  source_dir  = "${path.module}/lambda/chat-handler"
  output_path = "${path.module}/build/chat-handler.zip"
}

data "archive_file" "reminder_dispatcher" {
  type        = "zip"
  source_dir  = "${path.module}/lambda/reminder-dispatcher"
  output_path = "${path.module}/build/reminder-dispatcher.zip"
}

resource "aws_lambda_function" "chat_handler" {
  function_name = "${local.project_name}-${var.environment}-chat"
  role          = aws_iam_role.lambda_role.arn
  runtime       = "nodejs20.x"
  handler       = "index.handler"
  filename      = data.archive_file.chat_handler.output_path

  environment {
    variables = {
      SESSIONS_TABLE      = aws_dynamodb_table.sessions.name
      EVENT_BUS_NAME      = aws_cloudwatch_event_bus.automation.name
      SES_FROM_ADDRESS    = var.ses_from_address
      SES_DEFAULT_RECIPIENT = var.ses_default_recipient
    }
  }

  depends_on = [aws_iam_role_policy.lambda_policy]
}

resource "aws_lambda_function" "reminder_dispatcher" {
  function_name = "${local.project_name}-${var.environment}-reminder"
  role          = aws_iam_role.lambda_role.arn
  runtime       = "nodejs20.x"
  handler       = "index.handler"
  filename      = data.archive_file.reminder_dispatcher.output_path

  environment {
    variables = {
      SESSIONS_TABLE = aws_dynamodb_table.sessions.name
      SES_FROM_ADDRESS = var.ses_from_address
      SES_DEFAULT_RECIPIENT = var.ses_default_recipient
    }
  }

  depends_on = [aws_iam_role_policy.lambda_policy]
}

resource "aws_cloudwatch_event_rule" "reminder_schedule" {
  name                = "${local.project_name}-${var.environment}-reminder"
  description         = "Polls for due reminders and dispatches notifications"
  schedule_expression = "rate(5 minutes)"
  event_bus_name      = aws_cloudwatch_event_bus.automation.name
}

resource "aws_cloudwatch_event_target" "reminder_lambda_target" {
  rule      = aws_cloudwatch_event_rule.reminder_schedule.name
  arn       = aws_lambda_function.reminder_dispatcher.arn
  role_arn  = aws_iam_role.eventbridge_invoke.arn
  event_bus_name = aws_cloudwatch_event_bus.automation.name
}

resource "aws_lambda_permission" "allow_eventbridge_invoke" {
  statement_id  = "AllowExecutionFromEventBridge"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.reminder_dispatcher.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.reminder_schedule.arn
}

resource "aws_apigatewayv2_api" "http_api" {
  name          = "${local.project_name}-${var.environment}-api"
  protocol_type = "HTTP"
  cors_configuration {
    allow_origins = var.allowed_origins
    allow_methods = ["POST", "OPTIONS"]
    allow_headers = ["Content-Type", "Authorization"]
  }
}

resource "aws_apigatewayv2_integration" "chat_lambda" {
  api_id                 = aws_apigatewayv2_api.http_api.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.chat_handler.invoke_arn
  integration_method     = "POST"
  payload_format_version = "2.0"
  timeout_milliseconds   = 29000
}

resource "aws_apigatewayv2_route" "chat_route" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "POST /chat"
  target    = "integrations/${aws_apigatewayv2_integration.chat_lambda.id}"
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.http_api.id
  name        = "$default"
  auto_deploy = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_logs.arn
    format = jsonencode({
      requestId       = "$context.requestId"
      routeKey        = "$context.routeKey"
      status          = "$context.status"
      integrationErrorMessage = "$context.integrationErrorMessage"
    })
  }
}

resource "aws_cloudwatch_log_group" "api_logs" {
  name              = "/aws/apigateway/${aws_apigatewayv2_api.http_api.name}"
  retention_in_days = 14
}

resource "aws_lambda_permission" "allow_apigw_invoke" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.chat_handler.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.http_api.execution_arn}/*/*"
}

resource "aws_sns_topic" "escalations" {
  name = "${local.project_name}-${var.environment}-escalations"
}

resource "aws_sns_topic_subscription" "escalations_email" {
  topic_arn = aws_sns_topic.escalations.arn
  protocol  = "email"
  endpoint  = var.escalation_email
}




