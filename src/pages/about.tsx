function AboutPage() {
  return (
    <section className='flex flex-col items-center justify-center min-h-screen bg-green-50 p-6'>
      <div className='mb-6'>
      </div>
      <h1 className='flex flex-wrap gap-2 sm:gap-x-6 items-center justify-center text-4xl font-bold leading-none tracking-wide sm:text-6xl text-green-900'>
        We love
        <span className='bg-green-500 py-2 px-4 rounded-lg tracking-widest text-white'>
          GO TO GRASS
        </span>
      </h1>
      <p className='mt-6 text-lg tracking-wide leading-8 max-w-2xl text-center text-green-800'>
        Partner with us to unlock new opportunities for growth and revenue. Our platform offers seamless integration and advanced tools to help you attract more customers and increase your sales.
      </p>
      <div className='mt-6 max-w-3xl mx-auto text-center'>
        <h2 className='text-2xl font-semibold mb-4 text-green-900'>Why Join Us?</h2>
        <ul className='list-disc list-inside text-left text-green-800'>
          <li className='mb-4'>
            <strong>Unlock New Revenue Streams:</strong> Capitalize on our innovative voucher system to drive more business your way.
          </li>
          <li className='mb-4'>
            <strong>Enhance Your Visibility:</strong> Gain access to a large and engaged audience actively looking for deals and promotions.
          </li>
          <li className='mb-4'>
            <strong>Simple and Effective Marketing:</strong> Use our easy-to-use tools to create and manage promotional campaigns effortlessly.
          </li>
          <li className='mb-4'>
            <strong>Increased Customer Loyalty:</strong> Build lasting relationships through personalized offers and rewards.
          </li>
          <li className='mb-4'>
            <strong>Comprehensive Support:</strong> Enjoy dedicated support to help you maximize your success on our platform.
          </li>
          <li className='mb-4'>
            <strong>Easy Integration:</strong> Integrate seamlessly with minimal effort and start seeing results quickly.
          </li>
        </ul>
      </div>
      <a
        href='/signup' // Replace with your actual signup link or action
        className='mt-6 inline-block bg-green-500 text-white py-3 px-6 rounded-lg font-semibold text-lg hover:bg-green-600 transition-colors duration-300'
      >
        Join Us Now
      </a>
    </section>
  );
}

export default AboutPage;
