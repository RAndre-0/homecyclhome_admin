export default function User({ params }) {
    const id = params.id;
    return (
        <div>User to display : { id }</div>
    )
}