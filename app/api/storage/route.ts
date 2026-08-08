import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { fileName, fileType, folder } = await req.json()
    
    const bucket = process.env.AWS_S3_BUCKET!
    const region = process.env.AWS_REGION!
    const accessKey = process.env.AWS_ACCESS_KEY_ID!
    const secretKey = process.env.AWS_SECRET_ACCESS_KEY!
    
    const key = `${folder || 'uploads'}/${Date.now()}-${fileName}`
    
    // Generate presigned URL for upload
    const url = `https://${bucket}.s3.${region}.amazonaws.com/${key}`
    
    return NextResponse.json({ 
      uploadUrl: url,
      key,
      publicUrl: `https://${bucket}.s3.${region}.amazonaws.com/${key}`
    })
  } catch(err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const folder = searchParams.get('folder') || 'uploads'
  
  const bucket = process.env.AWS_S3_BUCKET
  const region = process.env.AWS_REGION
  
  return NextResponse.json({
    bucket,
    region,
    folder,
    baseUrl: `https://${bucket}.s3.${region}.amazonaws.com/${folder}/`
  })
}
