#!/bin/bash

echo "🚀 启动 MOVA GALA Next.js 项目..."

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js"
    exit 1
fi

# 检查 npm 是否安装
if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装，请先安装 npm"
    exit 1
fi

# 安装依赖
echo "📦 安装依赖..."
npm install

# 创建环境变量文件
if [ ! -f .env.local ]; then
    echo "🔧 创建环境变量文件..."
    cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=https://zilwwyrgetjplvwcowjl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppbHd3eXJnZXRqcGx2d2Nvd2psIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4ODI5NTQsImV4cCI6MjA3MTQ1ODk1NH0.iLGNdvqD1fuwUJjgbzhe4Mz_jbkIl3K_bCYroCs3QCE
EOF
    echo "✅ 环境变量文件已创建"
else
    echo "✅ 环境变量文件已存在"
fi

# 启动开发服务器
echo "🌐 启动开发服务器..."
echo "📱 访问地址: http://localhost:3000"
echo "🛑 按 Ctrl+C 停止服务器"
echo ""

npm run dev 