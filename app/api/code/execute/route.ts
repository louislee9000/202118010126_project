import { type NextRequest, NextResponse } from "next/server"
import { getQuestionById } from "@/lib/question-data"

// 执行代码的函数
async function executeCode(code: string, language: string) {
  try {
    // 首先检查代码语法
    const syntaxCheckResult = checkSyntax(code, language)
    if (!syntaxCheckResult.valid) {
      return {
        success: false,
        output: `Syntax Error: ${syntaxCheckResult.error}`,
        syntaxError: true,
      }
    }

    // 根据语言执行代码
    if (language === "javascript") {
      // 使用安全的方式执行JavaScript代码
      const result = await executeJavaScript(code)
      return { success: true, output: result }
    } else if (language === "python") {
      // 在实际应用中，这里会调用Python解释器或API
      return { success: false, output: "Python execution is not implemented yet." }
    } else if (language === "sql") {
      // 在实际应用中，这里会执行SQL查询
      return { success: false, output: "SQL execution is not implemented yet." }
    }

    return { success: false, output: "Unsupported language." }
  } catch (error) {
    return {
      success: false,
      output: `Execution error: ${error.message}`,
    }
  }
}

// 检查代码语法
function checkSyntax(code: string, language: string) {
  if (language === "javascript") {
    try {
      // 尝试解析JavaScript代码
      new Function(code)
      return { valid: true }
    } catch (error) {
      return {
        valid: false,
        error: error.message.replace(/Function$$$$/, "Your code"),
      }
    }
  } else if (language === "python") {
    // 简单的Python语法检查（实际应用中应使用Python解析器）
    if (!code.trim()) {
      return { valid: false, error: "Empty code" }
    }

    // 检查基本的Python语法错误
    const commonErrors = [
      { pattern: /print\s+[^(]/, error: "Missing parentheses in print statement" },
      { pattern: /^\s*def\s+\w+\s*[^:(]/, error: "Missing colon after function definition" },
      { pattern: /^\s*if\s+.*[^:]$/, error: "Missing colon after if statement" },
      { pattern: /^\s*for\s+.*[^:]$/, error: "Missing colon after for loop" },
      { pattern: /^\s*while\s+.*[^:]$/, error: "Missing colon after while loop" },
    ]

    for (const { pattern, error } of commonErrors) {
      if (pattern.test(code)) {
        return { valid: false, error }
      }
    }

    return { valid: true }
  } else if (language === "sql") {
    // 简单的SQL语法检查
    if (!code.trim()) {
      return { valid: false, error: "Empty query" }
    }

    // 检查基本的SQL语法
    const commonErrors = [
      { pattern: /SELECT.*FROM.*WHERE.*[^=><]=$/, error: "Invalid comparison in WHERE clause" },
      { pattern: /SELECT.*FROM.*ORDER\s+BY.*[^,]\s+$/, error: "Invalid ORDER BY clause" },
    ]

    for (const { pattern, error } of commonErrors) {
      if (pattern.test(code)) {
        return { valid: false, error }
      }
    }

    return { valid: true }
  }

  return { valid: true }
}

// 安全执行JavaScript代码
async function executeJavaScript(code: string) {
  try {
    // 创建一个安全的执行环境
    const consoleLogs = []
    const mockConsole = {
      log: (...args) => {
        consoleLogs.push(args.map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : String(arg))).join(" "))
      },
      error: (...args) => {
        consoleLogs.push(
          "ERROR: " + args.map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : String(arg))).join(" "),
        )
      },
      warn: (...args) => {
        consoleLogs.push(
          "WARNING: " + args.map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : String(arg))).join(" "),
        )
      },
    }

    // 创建一个函数来执行代码，提供模拟的console
    const executeFunction = new Function(
      "console",
      `
      try {
        // Add timeout to prevent infinite loops
        let executionTimeout = setTimeout(() => {
          throw new Error("Execution timed out. Your code took too long to run.");
        }, 5000);
        
        ${code}
        
        // Clear timeout if execution completes
        clearTimeout(executionTimeout);
        return { success: true, logs: [] }
      } catch (error) {
        return { success: false, error: error.message }
      }
    `,
    )

    const result = executeFunction(mockConsole)

    if (!result.success) {
      return `Runtime Error: ${result.error}`
    }

    return consoleLogs.join("\n") || "Code executed successfully (no output)"
  } catch (error) {
    return `Error: ${error.message}`
  }
}

// 检查解决方案的函数
async function checkSolution(code: string, questionId: string, language: string) {
  try {
    // 获取问题数据
    const question = getQuestionById(questionId)
    if (!question) {
      return { success: false, output: "Question not found." }
    }

    // 首先检查代码语法
    const syntaxCheckResult = checkSyntax(code, language)
    if (!syntaxCheckResult.valid) {
      return {
        success: false,
        output: `Syntax Error: ${syntaxCheckResult.error}\n\nPlease fix the syntax errors before submitting.`,
        syntaxError: true,
      }
    }

    // 执行用户代码
    const userResult = await executeCode(code, language)
    if (!userResult.success) {
      return {
        success: false,
        output: `Your code failed to execute:\n${userResult.output}`,
      }
    }

    // 执行标准解决方案
    const solutionResult = await executeCode(question.solution, language)
    if (!solutionResult.success) {
      return {
        success: false,
        output: "Error in standard solution. Please contact an administrator.",
      }
    }

    // 获取用户代码和标准解决方案的输出
    const userOutput = userResult.output.trim()
    const solutionOutput = solutionResult.output.trim()

    // 检查用户代码是否与标准解决方案匹配
    // 1. 首先进行严格比较
    if (userOutput === solutionOutput) {
      return {
        success: true,
        output: "Congratulations! Your solution is correct.\n\n" + `Your output:\n${userOutput}`,
      }
    }

    // 2. 如果严格比较失败，进行更宽松的比较（去除空格和换行符）
    const normalizeOutput = (output) => {
      return output.replace(/\s+/g, " ").trim()
    }

    const normalizedUserOutput = normalizeOutput(userOutput)
    const normalizedSolutionOutput = normalizeOutput(solutionOutput)

    if (normalizedUserOutput === normalizedSolutionOutput) {
      return {
        success: true,
        output:
          "Your solution is correct, but has minor formatting differences.\n\n" +
          `Your output:\n${userOutput}\n\n` +
          `Expected format:\n${solutionOutput}`,
      }
    }

    // 3. 如果宽松比较也失败，检查是否包含关键输出
    // 这里我们可以检查用户输出是否包含预期输出的关键部分
    const keyOutputParts = solutionOutput.split("\n").filter((line) => line.trim().length > 0)
    const missingParts = keyOutputParts.filter((part) => !userOutput.includes(part.trim()))

    if (missingParts.length === 0 && keyOutputParts.length > 0) {
      return {
        success: true,
        output:
          "Your solution produces the correct output but in a different format.\n\n" +
          `Your output:\n${userOutput}\n\n` +
          `Expected format:\n${solutionOutput}`,
      }
    }

    // 4. 如果以上所有比较都失败，则解决方案不正确
    return {
      success: false,
      output:
        "Your solution is incorrect.\n\n" + `Your output:\n${userOutput}\n\n` + `Expected output:\n${solutionOutput}`,
    }
  } catch (error) {
    console.error("Error checking solution:", error)
    return {
      success: false,
      output: `Error checking solution: ${error.message}`,
    }
  }
}

// 添加一个测试函数，用于测试解决方案检查逻辑
async function testSolutionCheck(userCode: string, solutionCode: string, language: string) {
  try {
    // 执行用户代码
    const userResult = await executeJavaScript(userCode)

    // 执行标准解决方案
    const solutionResult = await executeJavaScript(solutionCode)

    // 返回比较结果
    return {
      userOutput: userResult,
      solutionOutput: solutionResult,
      isEqual: userResult.trim() === solutionResult.trim(),
      normalizedEqual: userResult.replace(/\s+/g, " ").trim() === solutionResult.replace(/\s+/g, " ").trim(),
    }
  } catch (error) {
    return {
      error: error.message,
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { code, questionId, action, language, testMode } = await request.json()

    if (!code) {
      return NextResponse.json({ success: false, output: "No code provided." }, { status: 400 })
    }

    // 添加测试模式，用于调试
    if (testMode) {
      const testResult = await testSolutionCheck(code, testMode.solutionCode, language)
      return NextResponse.json({ testResult })
    }

    if (action === "execute") {
      const result = await executeCode(code, language)
      return NextResponse.json(result)
    } else if (action === "check") {
      const result = await checkSolution(code, questionId, language)
      return NextResponse.json(result)
    } else {
      return NextResponse.json({ success: false, output: "Invalid action." }, { status: 400 })
    }
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ success: false, output: `Server error: ${error.message}` }, { status: 500 })
  }
}

