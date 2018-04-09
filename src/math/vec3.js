class Vec3
{
	constructor(x, y, z)
	{
		this.x = x
		this.y = y
		this.z = z
	}


	magn()
	{
		return Math.sqrt(this.dot(this))
	}


	normalize()
	{
		const magn = this.magn()
		
		return new Vec3(
			this.x / magn,
			this.y / magn,
			this.z / magn)
	}


	add(other)
	{
		return new Vec3(
			this.x + other.x,
			this.y + other.y,
			this.z + other.z)
	}


	sub(other)
	{
		return new Vec3(
			this.x - other.x,
			this.y - other.y,
			this.z - other.z)
	}


	neg()
	{
		return new Vec3(
			-this.x,
			-this.y,
			-this.z)
	}


	scale(f)
	{
		return new Vec3(
			this.x * f,
			this.y * f,
			this.z * f)
	}


	dot(other)
	{
		return (this.x * other.x + this.y * other.y + this.z * other.z)
	}


	cross(other)
	{
		return new Vec3(
			this.y * other.z - this.z * other.y,
			this.z * other.x - this.x * other.z,
			this.x * other.y - this.y * other.x)
	}
}