export async function main(event: { message: string }) {
  return { message: `Success with message ${event?.message} 🎉` };
}
