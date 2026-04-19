import { streamText } from 'ai'
import { gateway } from '@ai-sdk/gateway'
import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { createGoogleGenerativeAI } from '@ai-sdk/google'

export const maxDuration = 60

export async function POST(req: Request) {
  const { 
    messages, 
    model = 'openai/gpt-4o', 
    systemPrompt,
    apiKey,
    baseUrl,
    maxTokens = 4096,
    temperature = 0.7,
    streaming = true
  } = await req.json()

  const systemMessage = systemPrompt || 
    `You are HORMULSE AI, an advanced self-evolving artificial intelligence system created by Fardin Arman Rafi. 
    You are knowledgeable, precise, and helpful. You provide comprehensive answers while maintaining a slightly futuristic and technological tone.
    You can discuss any topic and help with coding, analysis, creative tasks, and more.
    Always be helpful and informative while maintaining your unique personality.`

  try {
    // Determine provider and create appropriate client
    let aiModel
    
    if (apiKey) {
      // Use custom API key if provided
      const provider = model.split('/')[0]
      
      switch (provider) {
        case 'openai':
          const openai = createOpenAI({
            apiKey,
            baseURL: baseUrl || undefined
          })
          aiModel = openai(model.replace('openai/', ''))
          break
          
        case 'anthropic':
          const anthropic = createAnthropic({
            apiKey,
            baseURL: baseUrl || undefined
          })
          aiModel = anthropic(model.replace('anthropic/', ''))
          break
          
        case 'google':
          const google = createGoogleGenerativeAI({
            apiKey,
            baseURL: baseUrl || undefined
          })
          aiModel = google(model.replace('google/', ''))
          break
          
        default:
          // For other providers, try using the gateway with custom headers
          aiModel = gateway(model)
      }
    } else {
      // Use Vercel AI Gateway (zero config for supported providers)
      aiModel = gateway(model)
    }

    const result = streamText({
      model: aiModel,
      system: systemMessage,
      messages,
      maxTokens,
      temperature,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to process request' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
