import EventCard from "@/components/EventCard";
import ExploreBtn from "@/components/ExploreBtn";

import { events } from "@/lib/constants";

export default function Home() {

  return (
    <section>
      <h1 className="text-center text-4xl font-bold">Welcome to Evex</h1>
      <p className="text-center mt-5">Meetups, concerts, and more!</p>
      <ExploreBtn />

      <div className="mt-20 space-y-7">
        <h3>Featured Event</h3>

        <ul className="events">
          {events.map((event) => (
            <li key={event.title}>
              <EventCard {...event} />
            </li>
          ))}

        </ul>
      </div>
    </section>
  )
}