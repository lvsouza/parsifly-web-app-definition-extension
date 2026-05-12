ALTER TABLE "expressionNode" ALTER COLUMN "nodeType" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."enum_expression_node_type";--> statement-breakpoint
CREATE TYPE "public"."enum_expression_node_type" AS ENUM('if', 'output', 'inputString', 'inputNumber', 'inputBoolean', 'inputBinary', 'inputGetVariable', 'inputCallAction');--> statement-breakpoint
ALTER TABLE "expressionNode" ALTER COLUMN "nodeType" SET DATA TYPE "public"."enum_expression_node_type" USING "nodeType"::"public"."enum_expression_node_type";