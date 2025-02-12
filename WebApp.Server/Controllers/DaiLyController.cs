using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApp.API.Data;
using WebApp.Server.Models;

namespace WebApp.API.Controllers
{
    [Route("api/dai-ly")]
    [ApiController]
    public class DaiLyController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DaiLyController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/dai-ly
        [HttpGet]
        public async Task<ActionResult<IEnumerable<DaiLy>>> GetDaiLys()
        {
            return await _context.DaiLys
                .OrderBy(x => x.Ten)
                .ToListAsync();
        }

        // GET: api/dai-ly/5
        [HttpGet("{id}")]
        public async Task<ActionResult<DaiLy>> GetDaiLy(int id)
        {
            var daiLy = await _context.DaiLys.FindAsync(id);

            if (daiLy == null)
            {
                return NotFound();
            }

            return daiLy;
        }

        // GET: api/dai-ly/5/don-vis
        [HttpGet("{id}/don-vis")]
        public async Task<ActionResult<IEnumerable<DonVi>>> GetDonVisByDaiLy(int id)
        {
            var daiLy = await _context.DaiLys.FindAsync(id);
            if (daiLy == null)
            {
                return NotFound();
            }

            return await _context.DonVis
                .Where(d => d.DaiLyId == id)
                .OrderBy(d => d.TenDonVi)
                .ToListAsync();
        }

        // POST: api/dai-ly
        [HttpPost]
        public async Task<ActionResult<DaiLy>> PostDaiLy(DaiLy daiLy)
        {
            _context.DaiLys.Add(daiLy);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetDaiLy), new { id = daiLy.Id }, daiLy);
        }

        // PUT: api/dai-ly/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutDaiLy(int id, DaiLy daiLy)
        {
            if (id != daiLy.Id)
            {
                return BadRequest();
            }

            _context.Entry(daiLy).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!DaiLyExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/dai-ly/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDaiLy(int id)
        {
            var daiLy = await _context.DaiLys.FindAsync(id);
            if (daiLy == null)
            {
                return NotFound();
            }

            _context.DaiLys.Remove(daiLy);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool DaiLyExists(int id)
        {
            return _context.DaiLys.Any(e => e.Id == id);
        }
    }
} 