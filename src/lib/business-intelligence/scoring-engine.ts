/**
 * AmplifiBI Business Health Scoring Engine
 * Adapted from BizThriving App for production use
 * Calculates comprehensive business health scores using financial data
 */

import { prisma } from '@/lib/prisma'
import logger from '@/lib/logger'

// ==================== TYPES & INTERFACES ====================

export interface BusinessData {
  financial: {
    revenue: number
    expenses: number
    ebitda: number
    currentAssets: number
    currentLiabilities: number
    totalAssets: number
    totalLiabilities: number
    cashFlow: number[]  // Monthly cash flow history
  }
  operational: {
    customerCount: number
    invoiceCount: number
    averageInvoiceValue: number
    paymentTerms: number
    industryCode: string
    businessAge: number // months
  }
  growth: {
    revenueGrowthRate: number
    customerGrowthRate: number
    profitGrowthRate: number
  }
}

export interface ComponentScore {
  score: number
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F'
  factors: string[]
  insights: string[]
}

export interface HealthScore {
  overall: number
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F'
  components: {
    liquidity: ComponentScore
    profitability: ComponentScore
    leverage: ComponentScore
    operational: ComponentScore
    compliance: ComponentScore
  }
  loanEligibility: {
    secured: boolean
    unsecured: boolean
    growth: boolean
    estimatedAmount: number
    confidenceLevel: number
  }
  benchmarkComparison: {
    percentile: number
    industry: string
    peerComparison: string
    keyStrengths: string[]
  }
  insights: string[]
  recommendations: Array<{
    type: string
    priority: 'High' | 'Medium' | 'Low'
    title: string
    description: string
    impact: number
  }>
  calculatedAt: Date
}

// ==================== MAIN SCORING ENGINE ====================

export class BusinessHealthScoringEngine {
  public componentWeights = {
    liquidity: 0.25,
    profitability: 0.25,
    leverage: 0.20,
    operational: 0.20,
    compliance: 0.10
  }

  private industryBenchmarks: Map<string, any> = new Map()
  
  constructor() {
    this.loadDefaultBenchmarks()
  }

  /**
   * Main entry point - Calculate complete business health score
   */
  async calculateHealthScore(userId: string): Promise<HealthScore> {
    try {
      logger.info(`Calculating health score for user: ${userId}`)
      
      const businessData = await this.fetchBusinessData(userId)
      const score = await this.performHealthScoreCalculation(businessData)
      
      // Save to database for historical tracking
      await this.saveHealthScore(userId, score)
      
      logger.info(`Health score calculated: ${score.overall} (${score.grade})`)
      return score
      
    } catch (error) {
      logger.error('Health score calculation failed', { userId, error })
      throw new Error('Unable to calculate business health score')
    }
  }

  private async performHealthScoreCalculation(businessData: BusinessData): Promise<HealthScore> {
    // Calculate component scores
    const liquidityScore = this.calculateLiquidityScore(businessData)
    const profitabilityScore = this.calculateProfitabilityScore(businessData)
    const leverageScore = this.calculateLeverageScore(businessData)
    const operationalScore = this.calculateOperationalScore(businessData)
    const complianceScore = this.calculateComplianceScore(businessData)

    // Calculate weighted overall score
    const overallScore = Math.round(
      liquidityScore.score * this.componentWeights.liquidity +
      profitabilityScore.score * this.componentWeights.profitability +
      leverageScore.score * this.componentWeights.leverage +
      operationalScore.score * this.componentWeights.operational +
      complianceScore.score * this.componentWeights.compliance
    )

    const components = {
      liquidity: liquidityScore,
      profitability: profitabilityScore,
      leverage: leverageScore,
      operational: operationalScore,
      compliance: complianceScore
    }

    // Generate insights and recommendations
    const insights = this.generateInsights(businessData, components)
    const recommendations = this.generateRecommendations(businessData, components)
    const loanEligibility = this.assessLoanEligibility(businessData, overallScore)
    const benchmarkComparison = await this.generateBenchmarkComparison(businessData, overallScore)

    return {
      overall: overallScore,
      grade: this.getGrade(overallScore),
      components,
      loanEligibility,
      benchmarkComparison,
      insights,
      recommendations,
      calculatedAt: new Date()
    }
  }

  // ==================== COMPONENT SCORING METHODS ====================

  private calculateLiquidityScore(data: BusinessData): ComponentScore {
    const factors: string[] = []
    const insights: string[] = []
    let score = 50 // Base score

    // Current Ratio (Current Assets / Current Liabilities)
    if (data.financial.currentLiabilities > 0) {
      const currentRatio = data.financial.currentAssets / data.financial.currentLiabilities
      
      if (currentRatio >= 2.0) {
        score += 25
        factors.push('Strong current ratio')
        insights.push('Excellent short-term liquidity position')
      } else if (currentRatio >= 1.5) {
        score += 15
        factors.push('Good current ratio')
      } else if (currentRatio >= 1.0) {
        score += 5
        factors.push('Adequate current ratio')
        insights.push('Monitor cash flow closely')
      } else {
        score -= 20
        factors.push('Poor current ratio')
        insights.push('Critical liquidity concern - immediate attention needed')
      }
    }

    // Cash Flow Trend Analysis
    const cashFlowTrend = this.analyzeCashFlowTrend(data.financial.cashFlow)
    if (cashFlowTrend === 'improving') {
      score += 15
      factors.push('Improving cash flow trend')
      insights.push('Cash flow is trending positively')
    } else if (cashFlowTrend === 'declining') {
      score -= 15
      factors.push('Declining cash flow trend')
      insights.push('Cash flow decline requires attention')
    }

    // Working Capital Analysis
    const workingCapital = data.financial.currentAssets - data.financial.currentLiabilities
    const workingCapitalRatio = workingCapital / data.financial.revenue
    
    if (workingCapitalRatio >= 0.15) {
      score += 10
      factors.push('Healthy working capital')
    } else if (workingCapitalRatio < 0) {
      score -= 15
      factors.push('Negative working capital')
      insights.push('Working capital needs improvement')
    }

    return {
      score: Math.max(0, Math.min(100, score)),
      grade: this.getGrade(score),
      factors,
      insights
    }
  }

  private calculateProfitabilityScore(data: BusinessData): ComponentScore {
    const factors: string[] = []
    const insights: string[] = []
    let score = 50

    // Gross Profit Margin
    if (data.financial.revenue > 0) {
      const grossProfit = data.financial.revenue - data.financial.expenses
      const grossProfitMargin = grossProfit / data.financial.revenue
      
      if (grossProfitMargin >= 0.4) {
        score += 20
        factors.push('Excellent profit margins')
        insights.push('Strong pricing power and cost control')
      } else if (grossProfitMargin >= 0.2) {
        score += 10
        factors.push('Good profit margins')
      } else if (grossProfitMargin >= 0.1) {
        score += 5
        factors.push('Adequate profit margins')
      } else if (grossProfitMargin <= 0) {
        score -= 25
        factors.push('Operating at a loss')
        insights.push('Urgent need to address profitability')
      }
    }

    // EBITDA Analysis
    if (data.financial.revenue > 0) {
      const ebitdaMargin = data.financial.ebitda / data.financial.revenue
      
      if (ebitdaMargin >= 0.15) {
        score += 15
        factors.push('Strong EBITDA margins')
      } else if (ebitdaMargin >= 0.05) {
        score += 5
        factors.push('Moderate EBITDA margins')
      } else if (ebitdaMargin < 0) {
        score -= 20
        factors.push('Negative EBITDA')
        insights.push('Business is not generating positive earnings')
      }
    }

    // Revenue Growth
    if (data.growth.revenueGrowthRate >= 0.2) {
      score += 10
      factors.push('Strong revenue growth')
      insights.push('Business is expanding rapidly')
    } else if (data.growth.revenueGrowthRate >= 0.1) {
      score += 5
      factors.push('Moderate revenue growth')
    } else if (data.growth.revenueGrowthRate < -0.1) {
      score -= 15
      factors.push('Declining revenue')
      insights.push('Revenue decline needs immediate attention')
    }

    return {
      score: Math.max(0, Math.min(100, score)),
      grade: this.getGrade(score),
      factors,
      insights
    }
  }

  private calculateLeverageScore(data: BusinessData): ComponentScore {
    const factors: string[] = []
    const insights: string[] = []
    let score = 50

    // Debt-to-Asset Ratio
    if (data.financial.totalAssets > 0) {
      const debtToAssetRatio = data.financial.totalLiabilities / data.financial.totalAssets
      
      if (debtToAssetRatio <= 0.3) {
        score += 20
        factors.push('Low debt burden')
        insights.push('Conservative debt management')
      } else if (debtToAssetRatio <= 0.5) {
        score += 10
        factors.push('Moderate debt levels')
      } else if (debtToAssetRatio <= 0.7) {
        score -= 5
        factors.push('High debt levels')
        insights.push('Monitor debt servicing carefully')
      } else {
        score -= 20
        factors.push('Excessive debt burden')
        insights.push('Debt levels may be unsustainable')
      }
    }

    // Interest Coverage (simplified)
    if (data.financial.ebitda > 0) {
      const estimatedInterest = data.financial.totalLiabilities * 0.05 // Assume 5% average interest rate
      const interestCoverage = data.financial.ebitda / estimatedInterest
      
      if (interestCoverage >= 5) {
        score += 15
        factors.push('Strong debt service capability')
      } else if (interestCoverage >= 2.5) {
        score += 5
        factors.push('Adequate debt service capability')
      } else if (interestCoverage < 1.5) {
        score -= 20
        factors.push('Poor debt service capability')
        insights.push('Difficulty meeting debt obligations')
      }
    }

    return {
      score: Math.max(0, Math.min(100, score)),
      grade: this.getGrade(score),
      factors,
      insights
    }
  }

  private calculateOperationalScore(data: BusinessData): ComponentScore {
    const factors: string[] = []
    const insights: string[] = []
    let score = 50

    // Customer Diversification
    if (data.operational.customerCount >= 50) {
      score += 15
      factors.push('Well-diversified customer base')
    } else if (data.operational.customerCount >= 20) {
      score += 10
      factors.push('Moderate customer diversification')
    } else if (data.operational.customerCount < 5) {
      score -= 15
      factors.push('High customer concentration risk')
      insights.push('Consider diversifying customer base')
    }

    // Business Maturity
    if (data.operational.businessAge >= 60) { // 5+ years
      score += 10
      factors.push('Established business')
    } else if (data.operational.businessAge >= 24) { // 2+ years
      score += 5
      factors.push('Growing business')
    } else {
      score -= 5
      factors.push('Early-stage business')
      insights.push('Build track record over time')
    }

    // Invoice Management Efficiency
    const avgInvoiceValue = data.operational.averageInvoiceValue
    const invoiceFrequency = data.operational.invoiceCount / 12 // Monthly average
    
    if (invoiceFrequency >= 10 && avgInvoiceValue >= 1000) {
      score += 10
      factors.push('Efficient invoicing operations')
    } else if (invoiceFrequency >= 5) {
      score += 5
      factors.push('Regular invoicing activity')
    }

    // Payment Terms Analysis
    if (data.operational.paymentTerms <= 30) {
      score += 5
      factors.push('Reasonable payment terms')
    } else if (data.operational.paymentTerms > 60) {
      score -= 10
      factors.push('Extended payment terms')
      insights.push('Consider reducing payment terms to improve cash flow')
    }

    return {
      score: Math.max(0, Math.min(100, score)),
      grade: this.getGrade(score),
      factors,
      insights
    }
  }

  private calculateComplianceScore(data: BusinessData): ComponentScore {
    const factors: string[] = []
    const insights: string[] = []
    let score = 80 // Start high and deduct for issues

    // Simplified compliance scoring
    // In production, this would integrate with IRD and other compliance systems
    
    // Regular financial reporting
    if (data.operational.invoiceCount > 0) {
      factors.push('Active financial reporting')
    } else {
      score -= 20
      factors.push('No recent financial activity')
      insights.push('Ensure regular business activity reporting')
    }

    // Business structure indicators
    if (data.operational.businessAge >= 12) {
      factors.push('Established business structure')
    }

    // GST threshold considerations (NZ-specific)
    if (data.financial.revenue >= 60000) { // GST registration threshold
      factors.push('Above GST registration threshold')
      insights.push('Ensure GST compliance if not already registered')
    }

    return {
      score: Math.max(0, Math.min(100, score)),
      grade: this.getGrade(score),
      factors,
      insights
    }
  }

  // ==================== HELPER METHODS ====================

  public getGrade(score: number): 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F' {
    if (score >= 95) return 'A+'
    if (score >= 85) return 'A'
    if (score >= 80) return 'B+'
    if (score >= 75) return 'B'
    if (score >= 70) return 'C+'
    if (score >= 60) return 'C'
    if (score >= 50) return 'D'
    return 'F'
  }

  private analyzeCashFlowTrend(cashFlow: number[]): 'improving' | 'declining' | 'stable' {
    if (cashFlow.length < 3) return 'stable'
    
    const recent = cashFlow.slice(-3)
    const earlier = cashFlow.slice(-6, -3)
    
    if (earlier.length === 0) return 'stable'
    
    const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length
    const earlierAvg = earlier.reduce((sum, val) => sum + val, 0) / earlier.length
    
    const changePercent = (recentAvg - earlierAvg) / Math.abs(earlierAvg)
    
    if (changePercent > 0.1) return 'improving'
    if (changePercent < -0.1) return 'declining'
    return 'stable'
  }

  private generateInsights(data: BusinessData, components: any): string[] {
    const insights: string[] = []

    // Aggregate insights from all components
    Object.values(components).forEach((component: any) => {
      insights.push(...component.insights)
    })

    // Add overall insights
    if (components.liquidity.score < 60 && components.profitability.score > 75) {
      insights.push('Strong profits but cash flow management needs attention')
    }
    
    if (components.leverage.score < 50 && components.profitability.score < 60) {
      insights.push('High debt combined with low profitability poses significant risk')
    }

    return insights.filter((insight, index, self) => self.indexOf(insight) === index)
  }

  private generateRecommendations(data: BusinessData, components: any) {
    const recommendations = []

    // Liquidity recommendations
    if (components.liquidity.score < 60) {
      recommendations.push({
        type: 'cash_flow',
        priority: 'High' as const,
        title: 'Improve Cash Flow Management',
        description: 'Focus on reducing payment terms and improving collection processes',
        impact: 15
      })
    }

    // Profitability recommendations
    if (components.profitability.score < 60) {
      recommendations.push({
        type: 'profitability',
        priority: 'High' as const,
        title: 'Enhance Profitability',
        description: 'Review pricing strategy and cost structure optimization',
        impact: 20
      })
    }

    // Add more recommendations based on specific conditions
    return recommendations
  }

  private assessLoanEligibility(data: BusinessData, overallScore: number) {
    const revenue = data.financial.revenue
    const cashFlow = data.financial.ebitda
    
    return {
      secured: overallScore >= 60 && revenue >= 100000,
      unsecured: overallScore >= 70 && cashFlow > 0,
      growth: overallScore >= 80 && data.growth.revenueGrowthRate > 0.1,
      estimatedAmount: Math.min(revenue * 0.25, cashFlow * 5),
      confidenceLevel: Math.max(0.3, overallScore / 100)
    }
  }

  private async generateBenchmarkComparison(data: BusinessData, overallScore: number) {
    // Simplified benchmark comparison
    // In production, this would use real industry data
    return {
      percentile: Math.max(10, Math.min(90, overallScore)),
      industry: data.operational.industryCode || 'General Business',
      peerComparison: overallScore >= 75 ? 'Above Average' : overallScore >= 50 ? 'Average' : 'Below Average',
      keyStrengths: ['Financial Management', 'Operational Efficiency']
    }
  }

  // ==================== DATA ACCESS METHODS ====================

  private async fetchBusinessData(userId: string): Promise<BusinessData> {
    // Fetch data from existing AmplifiBI database
    const [user, customers, invoices, transactions] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.customer.findMany({ where: { userId } }),
      prisma.invoice.findMany({ 
        where: { userId },
        include: { items: true }
      }),
      prisma.transaction.findMany({ 
        where: { userId },
        orderBy: { date: 'desc' },
        take: 100
      })
    ])

    if (!user) throw new Error('User not found')

    // Calculate financial metrics from existing data
    const revenue = invoices
      .filter(inv => inv.status === 'PAID')
      .reduce((sum, inv) => sum + Number(inv.total), 0)

    const expenses = transactions
      .filter(tx => Number(tx.amount) < 0)
      .reduce((sum, tx) => sum + Math.abs(Number(tx.amount)), 0)

    const ebitda = revenue - expenses

    // Simplified asset/liability calculation
    const currentAssets = revenue * 0.3 // Simplified
    const currentLiabilities = expenses * 0.2 // Simplified
    const totalAssets = currentAssets * 1.5
    const totalLiabilities = currentLiabilities * 1.2

    // Calculate monthly cash flow history
    const cashFlow = this.calculateMonthlyCashFlow(transactions)

    // Calculate growth metrics
    const revenueGrowthRate = this.calculateRevenueGrowthRate(invoices)

    return {
      financial: {
        revenue,
        expenses,
        ebitda,
        currentAssets,
        currentLiabilities,
        totalAssets,
        totalLiabilities,
        cashFlow
      },
      operational: {
        customerCount: customers.length,
        invoiceCount: invoices.length,
        averageInvoiceValue: invoices.length > 0 ? revenue / invoices.length : 0,
        paymentTerms: customers.length > 0 ? 
          customers.reduce((sum, c) => sum + c.paymentTerms, 0) / customers.length : 30,
        industryCode: 'GENERAL', // Can be added to user profile
        businessAge: Math.floor((Date.now() - user.createdAt.getTime()) / (30 * 24 * 60 * 60 * 1000))
      },
      growth: {
        revenueGrowthRate,
        customerGrowthRate: 0.1, // Simplified
        profitGrowthRate: revenueGrowthRate * 0.8 // Simplified
      }
    }
  }

  private calculateMonthlyCashFlow(transactions: any[]): number[] {
    const monthlyFlow: { [key: string]: number } = {}
    
    transactions.forEach(tx => {
      const month = tx.date.toISOString().substring(0, 7)
      if (!monthlyFlow[month]) monthlyFlow[month] = 0
      monthlyFlow[month] += Number(tx.amount)
    })

    return Object.values(monthlyFlow).slice(-12) // Last 12 months
  }

  private calculateRevenueGrowthRate(invoices: any[]): number {
    // Simplified growth calculation
    const now = new Date()
    const sixMonthsAgo = new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000)
    const oneYearAgo = new Date(now.getTime() - 12 * 30 * 24 * 60 * 60 * 1000)

    const recentRevenue = invoices
      .filter(inv => inv.createdAt >= sixMonthsAgo && inv.status === 'PAID')
      .reduce((sum, inv) => sum + Number(inv.total), 0)

    const olderRevenue = invoices
      .filter(inv => inv.createdAt >= oneYearAgo && inv.createdAt < sixMonthsAgo && inv.status === 'PAID')
      .reduce((sum, inv) => sum + Number(inv.total), 0)

    if (olderRevenue === 0) return 0
    return (recentRevenue - olderRevenue) / olderRevenue
  }

  private async saveHealthScore(userId: string, score: HealthScore): Promise<void> {
    try {
      // This would save to a health_scores table
      // For now, we'll log it
      logger.info('Health score calculated', {
        userId,
        score: score.overall,
        grade: score.grade,
        calculatedAt: score.calculatedAt
      })
    } catch (error) {
      logger.error('Failed to save health score', { userId, error })
    }
  }

  private loadDefaultBenchmarks(): void {
    // Load industry benchmarks
    // In production, this would come from external APIs
    this.industryBenchmarks.set('GENERAL', {
      currentRatio: { poor: 1.0, fair: 1.5, good: 2.0, excellent: 3.0 },
      profitMargin: { poor: 0.05, fair: 0.15, good: 0.25, excellent: 0.40 }
    })
  }
}

// Export singleton instance
export const businessHealthScoring = new BusinessHealthScoringEngine()