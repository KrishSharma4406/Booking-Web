import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <div className="flex justify-center flex-col gap-4 items-center text-white h-[44vh] px-5 md:px-0 text-xs md:text-base">
        <div className="font-bold flex md:text-5xl justify-center items-center text-3xl gap-3">
          <span>Booking Web</span>
        </div>
        <p className="text-center md:text-left text-xl">
          Experience fine dining with seamless table reservations
        </p>
        <p className="text-center md:text-left">
          Book your perfect dining experience in real-time. Our live booking system ensures you never miss a spot at your favorite restaurant.
        </p>
        <div className="flex gap-3">
          <Link href={"/Login"}>
            <button type="button" className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">Book Now</button>
          </Link>

          <Link href="/about">
            <button type="button" className="text-white bg-gradient-to-br from-green-600 to-teal-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-green-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">Learn More</button>
          </Link>
        </div>
      </div>
      <div className="bg-white h-1 opacity-10">
      </div>

      <div className="text-white container mx-auto pb-32 pt-14 px-10">
        <h2 className="text-3xl font-bold text-center mb-14">Why Choose Our Booking System?</h2>
        <div className="flex gap-5 justify-around flex-wrap">
          <div className="item space-y-3 flex flex-col items-center justify-center max-w-xs">
            <div className="bg-gradient-to-br from-purple-600 to-blue-500 rounded-full p-4">
              <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="font-bold text-center text-xl">Real-Time Booking</p>
            <p className="text-center text-gray-300">Instant confirmation with live table availability updates</p>
          </div>
          <div className="item space-y-3 flex flex-col items-center justify-center max-w-xs">
            <div className="bg-gradient-to-br from-green-600 to-teal-500 rounded-full p-4">
              <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="font-bold text-center text-xl">Instant Approval</p>
            <p className="text-center text-gray-300">Get approved by our team and start booking immediately</p>
          </div>
          <div className="item space-y-3 flex flex-col items-center justify-center max-w-xs">
            <div className="bg-gradient-to-br from-orange-600 to-red-500 rounded-full p-4">
              <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <p className="font-bold text-center text-xl">Easy Management</p>
            <p className="text-center text-gray-300">Track all your reservations in one convenient dashboard</p>
          </div>
        </div>
      </div>

      <div className="bg-white h-1 opacity-10 mb-14">
      </div>

      <div className="text-white container mx-auto pb-20 px-10">
        <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          <div className="text-center">
            <div className="bg-blue-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">1</div>
            <h3 className="font-bold mb-2">Sign Up</h3>
            <p className="text-sm text-gray-300">Create your account in seconds</p>
          </div>
          <div className="text-center">
            <div className="bg-green-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">2</div>
            <h3 className="font-bold mb-2">Get Approved</h3>
            <p className="text-sm text-gray-300">Wait for admin approval</p>
          </div>
          <div className="text-center">
            <div className="bg-purple-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">3</div>
            <h3 className="font-bold mb-2">Book Table</h3>
            <p className="text-sm text-gray-300">Choose date, time & party size</p>
          </div>
          <div className="text-center">
            <div className="bg-orange-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">4</div>
            <h3 className="font-bold mb-2">Enjoy</h3>
            <p className="text-sm text-gray-300">Arrive and enjoy your meal</p>
          </div>
        </div>
      </div>
    </>
  )
}