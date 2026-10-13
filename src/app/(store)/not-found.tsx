import { PillLink } from "@/components/ui/Button";
import { Accent, SectionHeading } from "@/components/ui/SectionHeading";

export default function NotFound() {
  return (
    <section className="bg-grid pt-36 pb-24">
      <div className="container-page flex flex-col items-center text-center">
        <SectionHeading
          label="404"
          title={
            <>
              We couldn&apos;t find <Accent>that piece</Accent>
            </>
          }
          className="flex flex-col items-center"
        />
        <p className="mt-5 max-w-md text-muted">It may have sold out or moved. Take a look at the rest of the collection.</p>
        <PillLink href="/#collection" variant="dark" arrow className="mt-8">
          Back to the Collection
        </PillLink>
      </div>
    </section>
  );
}
